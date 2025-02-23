"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'react-qr-code';

// Динамичен импорт на react-barcode, за да изключим SSR
const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

interface FaschingData {
  ticket: {
    id: number;
    ticketType: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestClassGroup: string;
    ticketCode: string | null;
  };
  request: {
    id: number;
    paid: boolean;
    deleted: boolean;
    // ... други
  };
  ticketTypeLabel: string;
  formattedDateTime: string; 
}

interface NormalData {
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    guestCount: number;
    eventUuid: string;
    ticketToken: string;
  };
  event: {
    eventName: string;
    userUuid: string;
    description: string;
    thumbnailUrl: string;
    dateTime: string;
    location: string;
    price: any;
    isFree: boolean;
  };
  formattedDateTime: string;
}

export default function TicketClient(props: {
  isFasching: boolean;
  faschingData?: FaschingData;
  normalData?: NormalData;
}) {
  const { isFasching, faschingData, normalData } = props;

  if (isFasching && faschingData) {
    // Рендер фашинг билет (QR + Barcode)
    const { ticket, request, ticketTypeLabel, formattedDateTime } = faschingData;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover bgstyle text-black">
        <div className="absolute bg-blue-900 opacity-80 inset-0 z-0"></div>
        <div className="max-w-md w-full h-full mx-auto z-10 bg-blue-900 rounded-3xl">
          <div className="flex flex-col">
            <div className="bg-white dark:bg-white relative drop-shadow-2xl rounded-3xl p-4 m-4 ticketbox">
              <div className="flex-none sm:flex">
                <div className="flex-auto justify-evenly">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center my-1">
                      <img src="/logo.png" alt="Logo Eventify" className='w-20' />
                    </div>
                    <div className="ml-auto text-blue-800">{ticketTypeLabel}</div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5"></div>
                  <div className="flex items-center">
                    <div className="flex flex-col mx-auto">
                      <img
                        src="https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?ixlib=rb-1.2.1&w=300"
                        alt="Fasching placeholder"
                        className='w-60 rounded-xl'
                      />
                    </div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5 pt-5">
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
                  </div>
                  <div className="flex items-center mb-5 p-5 text-sm gap-10">
                    <div className="flex flex-col">
                      <span className="text-sm">Име</span>
                      <div className="font-semibold">
                        {ticket.guestFirstName} {ticket.guestLastName}
                      </div>
                    </div>
                    <div className="flex flex-col ml-auto">
                      <span className="text-sm">Клас/Група</span>
                      <div className="font-semibold">
                        {ticket.guestClassGroup}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mb-4 px-5">
                    <div className="flex flex-col text-sm">
                      <span>Дата на създаване</span>
                      <div className="font-semibold">{formattedDateTime}</div>
                    </div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5 pt-5">
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
                  </div>
                  <div className="flex items-center px-5 pt-3 text-sm">
                    <div className="flex flex-col">
                      <span>Имейл</span>
                      <div className="font-semibold">{ticket.guestEmail}</div>
                    </div>
                  </div>
                  <div className="flex flex-col py-5 justify-center text-sm">
                    <h6 className="font-bold text-center">Fasching Билет</h6>
                    {/* QR код */}
                    <div className="w-full flex items-center justify-center mt-5">
                      {ticket.ticketCode && (
                        <QRCode value={ticket.ticketCode} size={150} />
                      )}
                    </div>
                    {/* Баркод */}
                    <div className="w-full flex items-center justify-center mt-3">
                      {ticket.ticketCode && (
                        <Barcode
                          value={ticket.ticketCode}
                          width={1.5}
                          height={60}
                          format="CODE128"
                          displayValue={true}
                          fontSize={14}
                          textMargin={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
    );
  }

  if (!isFasching && normalData) {
    // Стар билет (eventCustomers)
    const { customer, event, formattedDateTime } = normalData;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover bgstyle text-black">
        <div className="absolute bg-blue-900 opacity-80 inset-0 z-0"></div>
        <div className="max-w-md w-full h-full mx-auto z-10 bg-blue-900 rounded-3xl">
          <div className="flex flex-col">
            <div className="bg-white dark:bg-white relative drop-shadow-2xl rounded-3xl p-4 m-4 ticketbox">
              <div className="flex-none sm:flex">
                <div className="flex-auto justify-evenly">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center my-1">
                      <img src="/logo.png" alt="Logo Eventify" className='w-20' />
                    </div>
                    <div className="ml-auto text-blue-800">{event.eventName}</div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5"></div>
                  <div className="flex items-center">
                    <div className="flex flex-col mx-auto">
                      <img src={event.thumbnailUrl} alt="Event Thumbnail" className='w-60 rounded-xl' />
                    </div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5 pt-5">
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
                  </div>
                  <div className="flex items-center mb-5 p-5 text-sm gap-10">
                    <div className="flex flex-col">
                      <span>Event</span>
                      <div className="font-semibold">{event.eventName}</div>
                    </div>
                    <div className="flex flex-col ml-auto">
                      <span>Location</span>
                      <div className="font-semibold">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center mb-4 px-5">
                    <div className="flex flex-col text-sm">
                      <span>Date and time</span>
                      <div className="font-semibold">{formattedDateTime}</div>
                    </div>
                  </div>
                  <div className="border-b border-dashed border-b-2 my-5 pt-5">
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                    <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
                  </div>
                  <div className="flex items-center px-5 pt-3 text-sm">
                    <div className="flex flex-col">
                      <span>Main Participant</span>
                      <div className="font-semibold">
                        {customer.firstname} {customer.lastname}
                      </div>
                    </div>
                    <div className="flex flex-col mx-auto">
                      <div className="font-semibold">{customer.guestCount} pax</div>
                    </div>
                  </div>
                  <div className="flex flex-col py-5 justify-center text-sm ">
                    <h6 className="font-bold text-center ">Ticket</h6>
                    <div className="w-full flex items-center justify-center mt-5">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${customer.ticketToken}`}
                        alt="Qr Code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
    );
  }

  // Ако не е нито фашинг, нито нормален
  return null;
}