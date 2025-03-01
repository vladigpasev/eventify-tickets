import { notFound } from "next/navigation";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import {
  eventCustomers,
  events,
  faschingRequests,
  faschingTickets,
} from "../../schema/schema";
import TicketClient from "./TicketClient";

const db = drizzle(sql);

/** 
 * Декодираме JWT, за да вземем ticketCode (за фашинг) 
 * или customerUuid (за не-фашинг).
*/
function decodeTicketToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, payload: null };
  }
}

/** Форматираме дата */
function formatDateTime(dateTimeString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const dt = new Date(dateTimeString);
  const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(dt);
  return formattedDate.replace(/\//g, ".").replace(/, /, ", ");
}

export default async function TicketPage({
  params,
}: {
  params: { ticket_token: string };
}) {
  const rawJwt = params.ticket_token;

  // 1) Декодираме JWT
  const decoded = decodeTicketToken(rawJwt);
  if (!decoded.valid) {
    notFound();
  }
  const payload = decoded.payload;

  // 2) Ако има ticketCode => фашинг
  //@ts-expect-error
  if (payload.ticketCode) {
    // Търсим билета + votedAt
    const [ticket] = await db
      .select({
        id: faschingTickets.id,
        ticketType: faschingTickets.ticketType,
        guestFirstName: faschingTickets.guestFirstName,
        guestLastName: faschingTickets.guestLastName,
        guestEmail: faschingTickets.guestEmail,
        guestClassGroup: faschingTickets.guestClassGroup,
        ticketCode: faschingTickets.ticketCode,
        votedAt: faschingTickets.votedAt,
        createdAt: faschingTickets.createdAt,
        requestId: faschingTickets.requestId,
      })
      .from(faschingTickets)
      //@ts-expect-error
      .where(eq(faschingTickets.ticketCode, payload.ticketCode))
      .execute();

    if (!ticket) {
      notFound();
    }

    // Намираме request, за да видим paid, deleted
    const [request] = await db
      .select({
        id: faschingRequests.id,
        paid: faschingRequests.paid,
        deleted: faschingRequests.deleted,
        createdAt: faschingRequests.createdAt,
      })
      .from(faschingRequests)
      .where(eq(faschingRequests.id, ticket.requestId!))
      .execute();

    if (!request || request.deleted) {
      notFound();
    }
    // Ако искаме да покажем билет само, ако е платен => проверка:
    // if (!request.paid) { notFound(); }

    // Примерно статично име/дата
    const ticketTypeLabel =
      ticket.ticketType === "fasching-after" || ticket.ticketType === "fasching_after"
        ? "Фашинг + Афтър"
        : "Фашинг";

    // Форматирана дата (примерно на създаване на заявката):
    const dateTimeString = request.createdAt?.toString() || "";
    const formatted = dateTimeString ? formatDateTime(dateTimeString) : "N/A";

    // Генерираме "Линк за гласуване", ако не е гласувал
    let voteLink = "";
    if (!ticket.votedAt && ticket.ticketCode) {
      // Създаваме JWT за вот
      const voteToken = jwt.sign(
        { ticketCode: ticket.ticketCode },
        process.env.JWT_SECRET!
      );
      voteLink = `https://fasching.eventify.bg/vote?token=${voteToken}`;
    }

    // Подготвяме props за Client
    return (
      <TicketClient
        isFasching={true}
        faschingData={{
          ticket,
          request,
          ticketTypeLabel,
          formattedDateTime: formatted,
          voteLink,
        }}
      />
    );
    //@ts-expect-error
  } else if (payload.uuid) {
    // => Не-фашинг
    //@ts-expect-error
    const customerUuid = payload.uuid as string;

    const currentCustomerDb = await db
      .select({
        firstname: eventCustomers.firstname,
        lastname: eventCustomers.lastname,
        email: eventCustomers.email,
        guestCount: eventCustomers.guestCount,
        eventUuid: eventCustomers.eventUuid,
        ticketToken: eventCustomers.ticketToken,
      })
      .from(eventCustomers)
      .where(eq(eventCustomers.uuid, customerUuid))
      .execute();

    if (!currentCustomerDb.length) {
      notFound();
    }
    const currentCustomer = currentCustomerDb[0];
    const eventId = currentCustomer.eventUuid;

    const currentEventDb = await db
      .select({
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
          formattedDateTime: formattedDT,
        }}
      />
    );
  }

  // Нито ticketCode, нито uuid => 404
  notFound();
}
