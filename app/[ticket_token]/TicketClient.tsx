"use client";

import React from "react";
import dynamic from "next/dynamic";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

// Динамичен import на react-barcode, за да изключим SSR:
const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

// Типове
interface FaschingData {
  ticket: {
    id: number;
    ticketType: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestClassGroup: string;
    ticketCode: string | null;
    votedAt?: Date | null; // може да е Date | null
  };
  request: {
    id: number;
    paid: boolean;
    deleted: boolean;
  };
  ticketTypeLabel: string;
  formattedDateTime: string;
  voteLink?: string; // добавяме
}

// При не-фашинг
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
    price: number;
    isFree: boolean;
  };
  formattedDateTime: string;
}

export default function TicketClient(props: {
  isFasching?: boolean;
  faschingData?: FaschingData;
  normalData?: NormalData;
}) {
  const { isFasching, faschingData, normalData } = props;

  // Framer Motion animation
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Reusable fancy divider
  const FancyDivider = () => (
    <div className="relative my-5 pt-5 border-b border-dashed border-b-2 border-yellow-700">
      <div className="absolute rounded-full w-5 h-5 bg-yellow-900 -mt-2 -left-2"></div>
      <div className="absolute rounded-full w-5 h-5 bg-yellow-900 -mt-2 -right-2"></div>
    </div>
  );

  if (isFasching && faschingData) {
    const {
      ticket,
      ticketTypeLabel,
      formattedDateTime,
      voteLink,
    } = faschingData;

    // Ако `votedAt` е null => не е гласувал
    const hasVoted = !!ticket.votedAt; 
    const canVote = !hasVoted && voteLink; // ако няма votedAt и имаме voteLink

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-no-repeat bg-center text-white relative"
        style={{
          backgroundImage:
            "url('https://fasching.eventify.bg/event-thumbnail.jpg')",
        }}
      >
        {/* Тъмен overlay */}
        <div className="absolute inset-0 bg-yellow-900 bg-opacity-40"></div>

        {/* Animated Ticket */}
        <motion.div
          className="z-10 w-full max-w-md mx-auto p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Ticket Box */}
          <div className="bg-white text-yellow-900 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <img
                  src="/logo.png"
                  alt="Logo Eventify"
                  className="w-24 h-auto"
                />
                <div className="text-yellow-800 font-semibold">
                  {ticketTypeLabel}
                </div>
              </div>
              <FancyDivider />
              {/* Бутон за гласуване */}
              <div className="mt-4 flex justify-center">
                  {canVote ? (
                    <motion.a
                      href={voteLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition flex items-center gap-2"
                    >
                      <span>Гласувай сега</span>
                      <span>🗳</span>
                    </motion.a>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 font-semibold px-5 py-2 rounded-full shadow cursor-not-allowed"
                    >
                      {hasVoted ? "Вече сте гласували" : "Гласуването не е достъпно"}
                    </button>
                  )}
                </div>

              <FancyDivider />

              <div className="flex items-center justify-center">
                <img
                  src="https://fasching.eventify.bg/event-thumbnail.jpg"
                  alt="Fasching placeholder"
                  className="w-60 h-auto rounded-xl shadow-lg"
                />
              </div>

              <FancyDivider />

              <div className="text-sm space-y-3">
                <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Име</span>
                    <span className="font-semibold">
                      {ticket.guestFirstName} {ticket.guestLastName}
                    </span>
                  </div>
                  <div className="flex flex-col ml-auto">
                    <span className="text-xs text-gray-500">Клас/Група</span>
                    <span className="font-semibold">{ticket.guestClassGroup}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Дата на създаване</span>
                  <div className="font-semibold">{formattedDateTime}</div>
                </div>
              </div>

              <FancyDivider />

              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs text-gray-500">Имейл</span>
                  <div className="font-semibold">{ticket.guestEmail}</div>
                </div>

                <div className="flex flex-col items-center pt-2">
                  <h6 className="font-bold text-lg mb-3">Fasching Билет</h6>

                  {/* QR код */}
                  {ticket.ticketCode && (
                    <div className="my-2">
                      <QRCode value={ticket.ticketCode} size={150} />
                    </div>
                  )}

                  {/* Баркод */}
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
        </motion.div>
      </div>
    );
  }

  // Не-фашинг сценарий (пример)
  if (!isFasching && normalData) {
    // ... твоя логика за другия тип event ...
    return <div>Non-Fasching Ticket</div>;
  }

  // Ако няма нищо, не рендерираме
  return null;
}
