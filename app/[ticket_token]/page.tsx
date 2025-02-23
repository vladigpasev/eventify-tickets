import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { eq } from 'drizzle-orm';
//@ts-ignore
import jwt from 'jsonwebtoken';
import { eventCustomers, events, faschingRequests, faschingTickets } from '../../schema/schema';
import TicketClient from './TicketClient';

const db = drizzle(sql);

/** 
 * Декодираме JWT, за да вземем ticketCode (за фашинг) 
 * или customerUuid (за не-фашинг).
*/
function decodeTicketToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, payload: null };
  }
}

/** Форматираме дата (както преди) */
function formatDateTime(dateTimeString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const dt = new Date(dateTimeString);
  const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(dt);
  return formattedDate.replace(/\//g, '.').replace(/, /, ', ');
}

export default async function TicketPage({ params }: { params: { ticket_token: string } }) {
  const rawJwt = params.ticket_token;
  // 1) Декодираме JWT
  const decoded = decodeTicketToken(rawJwt);
  if (!decoded.valid) {
    notFound();
  }
  const payload = decoded.payload;
  // Предполагаме, че payload може да съдържа: { ticketCode } за фашинг, или { uuid } за не-фашинг
  // Или може да съдържа и двете, решавате вие. Например:
  // { isFasching: true, ticketCode: "..."}  или  { isFasching: false, uuid: "..." }

  // 2) Проверяваме дали има 'ticketCode' => фашинг
  if (payload.ticketCode) {
    // => фашинг
    const [ticket] = await db
      .select()
      .from(faschingTickets)
      .where(eq(faschingTickets.ticketCode, payload.ticketCode))
      .execute();
    if (!ticket) {
      notFound();
    }
    // Намираме request, за да видим paid, deleted
    const [request] = await db
      .select()
      .from(faschingRequests)
      .where(eq(faschingRequests.id, ticket.requestId))
      .execute();
    if (!request || request.deleted) {
      notFound();
    }

    // (По избор) Ако искате да показвате само платени билети:
    // if (!request.paid) { notFound(); }

    // Нямаме eventName/dateTime за фашинг, освен ако не сте добавили. 
    // За пример слагаме "Fasching 2024" статично, 
    // или добавяте колони в faschingRequests за dateTime.
    const ticketTypeLabel = 
      ticket.ticketType === 'fasching_after' || ticket.ticketType === 'fasching-after'
        ? 'Фашинг + Афтър'
        : 'Фашинг';

    // Примерна дата
    const dateTimeString = request.createdAt?.toString() || "";
    const formatted = dateTimeString ? formatDateTime(dateTimeString) : "N/A";

    // Подготвяме "props" за Client компонента
    return (
      <TicketClient
        isFasching={true}
        faschingData={{
          ticket,
          request,
          ticketTypeLabel,
          formattedDateTime: formatted,
        }}
      />
    );
  } else if (payload.uuid) {
    // => Не-фашинг (стар JWT)
    // Намираме eventCustomers
    const customerUuid = payload.uuid;
    const currentCustomerDb = await db.select({
      firstname: eventCustomers.firstname,
      lastname: eventCustomers.lastname,
      email: eventCustomers.email,
      guestCount: eventCustomers.guestCount,
      eventUuid: eventCustomers.eventUuid,
      ticketToken: eventCustomers.ticketToken
    })
      .from(eventCustomers)
      .where(eq(eventCustomers.uuid, customerUuid))
      .execute();

    if (!currentCustomerDb.length) {
      notFound();
    }
    const currentCustomer = currentCustomerDb[0];
    const eventId = currentCustomer.eventUuid;

    const currentEventDb = await db.select({
      eventName: events.eventName,
      userUuid: events.userUuid,
      description: events.description,
      thumbnailUrl: events.thumbnailUrl,
      dateTime: events.dateTime,
      location: events.location,
      price: events.price,
      isFree: events.isFree,
    })
      .from(events)
      .where(eq(events.uuid, eventId))
      .execute();
    if (!currentEventDb.length) {
      notFound();
    }
    const currentEvent = currentEventDb[0];
    const formattedDT = formatDateTime(currentEvent.dateTime);

    return (
      <TicketClient
        isFasching={false}
        normalData={{
          //@ts-expect-error
          customer: currentCustomer,
          //@ts-expect-error
          event: currentEvent,
          formattedDateTime: formattedDT
        }}
      />
    );
  }

  // Ако нито ticketCode, нито uuid => 404
  notFound();
}