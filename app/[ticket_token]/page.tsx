import React from 'react'
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { eq } from 'drizzle-orm';
import { eventCustomers, events } from '../../schema/schema';
//@ts-ignore
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation';
import QRCode from 'react-qr-code';

const db = drizzle(sql);

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
//@ts-ignore
function formatDateTime(dateTimeString) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  // Format the date with Intl.DateTimeFormat and convert it to the desired format
  //@ts-ignore
  const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date(dateTimeString));
  return formattedDate.replace(/\//g, '.').replace(/, /, ', ');
}


async function isValidToken(token: any) {
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    return ({ valid: true, decodedToken });
  } catch (err) {
    return ({ valid: false });
  }
}
async function Ticket({ params }: { params: { ticket_token: string } }) {
  const tokenValidation = await isValidToken(params.ticket_token);
  if (!(tokenValidation.valid)) {
    notFound();
    return;
  }

  const decodedToken = tokenValidation.decodedToken;
  const customerUuid = decodedToken.uuid;

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

  if (currentCustomerDb.length > 0) {
    // There are results
  } else {
    notFound();
  }

  const currentCustomer = currentCustomerDb[0];
  const eventId = currentCustomerDb[0].eventUuid;
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

  const currentEvent = currentEventDb[0];

  // Here you would have your state and methods for handling changes,
  // form submissions, and other interactions.
  const formattedDateTime = formatDateTime(currentEvent.dateTime);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover bgstyle">
        <div className="absolute bg-blue-900 opacity-80 inset-0 z-0"></div>
        <div className="max-w-md w-full h-full mx-auto z-10 bg-blue-900 rounded-3xl">
          <div className="flex flex-col">
            <div className="bg-white relative drop-shadow-2xl  rounded-3xl p-4 m-4">
              <div className="flex-none sm:flex">
                <div className=" relative h-32 w-32   sm:mb-0 mb-3 hidden">

                  <img src="https://tailwindcomponents.com/storage/avatars/njkIbPhyZCftc4g9XbMWwVsa7aGVPajYLRXhEeoo.jpg" alt="aji" className=" w-32 h-32 object-cover rounded-2xl" />
                  <a href="#"
                    className="absolute -right-2 bottom-2   -ml-3  text-white p-1 text-xs bg-green-400 hover:bg-green-500 font-medium tracking-wider rounded-full transition ease-in duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                      className="h-4 w-4">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z">
                      </path>
                    </svg>
                  </a>
                </div>
                <div className="flex-auto justify-evenly">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center  my-1">
                      <img src="/logo.png" alt="Logo Eventify" className='w-20' />
                    </div>
                    <div className="ml-auto text-blue-800">{currentEvent.eventName}</div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5"></div>
                  <div className="flex items-center">

                    <div className="flex flex-col mx-auto">
                      <img src={currentEvent.thumbnailUrl} alt="Event Thumbnai" className='w-60 rounded-xl' />
                    </div>

                  </div>
                  <div className="border-b border-dashed border-b-2 my-5 pt-5">
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
                  </div>
                  <div className="flex items-center mb-5 p-5 text-sm gap-10">
                    <div className="flex flex-col">
                      <span className="text-sm">Event</span>
                      <div className="font-semibold">{currentEvent.eventName}</div>

                    </div>
                    <div className="flex flex-col ml-auto">
                      <span className="text-sm">Location</span>
                      <div className="font-semibold">{currentEvent.location}</div>

                    </div>
                  </div>
                  <div className="flex items-center mb-4 px-5">
                    <div className="flex flex-col text-sm">
                      <span className="">Date and time</span>
                      <div className="font-semibold">{formattedDateTime}</div>

                    </div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5 pt-5">
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
                  </div>
                  <div className="flex items-center px-5 pt-3 text-sm">
                    <div className="flex flex-col">
                      <span className="">Main Participant</span>
                      <div className="font-semibold">{currentCustomer.firstname} {currentCustomer.lastname}</div>

                    </div>
                    {/* <div className="flex flex-col mx-auto">
                      <span className="">Class</span>
                      <div className="font-semibold">Economic</div>

                    </div>
                    <div className="flex flex-col">
                      <span className="">Seat</span>
                      <div className="font-semibold">12 E</div>

                    </div> */}
                  </div>
                  <div className="flex flex-col py-5  justify-center text-sm ">
                    <h6 className="font-bold text-center ">Ticket</h6>
                    {/*@ts-ignore*/}
                    <div className="w-full flex items-center justify-center mt-5"><QRCode value={currentCustomer.ticketToken} size={128} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Ticket