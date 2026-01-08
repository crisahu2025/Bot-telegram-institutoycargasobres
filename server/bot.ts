
import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";
import nodemailer from "nodemailer";

const token = process.env.TELEGRAM_TOKEN || "8557005763:AAFs3AvvarCmiDYHxBAkQZuKcOUOBOmDVis";

let bot: TelegramBot;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cris.ahu777@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

async function sendNotificationEmail(subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: 'cris.ahu777@gmail.com',
      to: 'cris.ahu777@gmail.com',
      subject: subject,
      text: text,
    });
    console.log("Email sent successfully:", subject);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

const MINISTRIES_LIST = [
  "MINIST JOVENES",
  "MINIST JOVENES ADULTOS",
  "MINIST DE HOMBRES",
  "MINIST NIÑOS",
  "MINIST ESPECIALES",
  "MINIST DE ADOLESCENTES",
  "MINIST DE PRE",
  "MINIST DE EDUCACION CRISTIANA",
  "MINIST DE FAMILIA",
  "MINIST DE EVANGELISMO",
  "MINIST DE MUJERES",
  "MINIST DE PROTOCOLO"
];

export function startBot() {
  if (bot) return bot;

  console.log("Starting Telegram Bot...");
  bot = new TelegramBot(token, { polling: true });

  const mainKeyboard = () => ({
    keyboard: [
      [{ text: "Cargar sobre de espiga" }],
      [{ text: "📚 Inscripción al Instituto Bíblico Horeb" }],
      [{ text: "🙏 Enviar petición de oración" }],
      [{ text: "NUEVOS DE ESPIGAS" }],
      [{ text: "Terminar" }]
    ],
    resize_keyboard: true,
  });

  const cancelKeyboard = {
    keyboard: [[{ text: "Terminar" }]],
    resize_keyboard: true,
  };

  const siNoKeyboard = {
    keyboard: [[{ text: "SI" }], [{ text: "NO" }], [{ text: "Terminar" }]],
    resize_keyboard: true,
  };

  const getUserName = (msg: TelegramBot.Message) => {
    return `${msg.from?.first_name || ""} ${msg.from?.last_name || ""}`.trim();
  };

  bot.on("message", async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id.toString();
    const text = (msg.text || "").trim();
    const telegramId = msg.from?.id.toString() || "";

    if (!telegramId || msg.from?.is_bot) return;

    let user = await storage.getBotUser(telegramId);
    if (!user) {
      user = await storage.createBotUser({
        telegram_id: telegramId,
        first_name: msg.from?.first_name,
        last_name: msg.from?.last_name,
        username: msg.from?.username,
      });
    }

    if (text === "/start" || text === "Hola") {
      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, "Hola Soy BONI 🤍\n¿En qué te puedo ayudar hoy?", {
        reply_markup: mainKeyboard(),
      });
      return;
    }

    if (text === "Terminar") {
      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, "Proceso cancelado. Gracias por comunicarte con BONI 🙌", {
        reply_markup: mainKeyboard(),
      });
      return;
    }

    const state = user?.step;
    const session = (user?.session_data as any) || {};

    if (!state) {
      if (text === "Cargar sobre de espiga") {
        const keyboard = {
          keyboard: [...MINISTRIES_LIST.map(m => [{ text: m }]), [{ text: "Terminar" }]],
          resize_keyboard: true
        };
        await storage.updateBotUserStep(telegramId, "env_ministry");
        await bot.sendMessage(chatId, "¿En qué ministerio estás trabajando?", { reply_markup: keyboard });
      } else if (text === "🙏 Enviar petición de oración") {
        await storage.updateBotUserStep(telegramId, "prayer_request");
        await bot.sendMessage(chatId, "🙏 ¿Cuál es el motivo de tu petición de oración?", { reply_markup: cancelKeyboard });
      } else if (text === "NUEVOS DE ESPIGAS") {
        await storage.updateBotUserStep(telegramId, "new_person_details");
        await bot.sendMessage(chatId, "Decime los detalles de la persona nueva:", { reply_markup: cancelKeyboard });
      }
      return;
    }

    // --- FLOW: ENVELOPE (SOBRES) ---
    if (state === "env_ministry") {
      await storage.updateBotUserStep(telegramId, "env_mentor", { ministry_name: text });
      await bot.sendMessage(chatId, "¿Quién es tu mentor?", { reply_markup: cancelKeyboard });
    } else if (state === "env_mentor") {
      await storage.updateBotUserStep(telegramId, "env_leader_validate", { mentor_name: text });
      await bot.sendMessage(chatId, "¿Cuál es tu nombre?", { reply_markup: cancelKeyboard });
    } else if (state === "env_leader_validate") {
      const authorizedLeaders = await storage.getLeaders();
      const isValid = authorizedLeaders.some(l => l.name.toLowerCase() === text.toLowerCase());
      
      if (!isValid) {
        await bot.sendMessage(chatId, "No te encuentro en la lista de líderes para cargar el sobre.", { reply_markup: mainKeyboard() });
        await storage.updateBotUserStep(telegramId, null);
      } else {
        await storage.updateBotUserStep(telegramId, "env_people_count", { leader_name: text });
        await bot.sendMessage(chatId, "¿Cuántas personas hubo?", { reply_markup: cancelKeyboard });
      }
    } else if (state === "env_people_count") {
      await storage.updateBotUserStep(telegramId, "env_new_person", { people_count: text });
      await bot.sendMessage(chatId, "¿Hay alguien nuevo?", { reply_markup: siNoKeyboard });
    } else if (state === "env_new_person") {
      await storage.updateBotUserStep(telegramId, "env_offering", { is_new_person: text });
      await bot.sendMessage(chatId, "Monto de la ofrenda:", { reply_markup: cancelKeyboard });
    } else if (state === "env_offering") {
      await storage.updateBotUserStep(telegramId, "env_photo", { offering: text });
      await bot.sendMessage(chatId, "Por favor, subí la foto del sobre:", { reply_markup: cancelKeyboard });
    } else if (state === "env_photo" && msg.photo) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const photoUrl = await bot.getFileLink(photoId);
      await storage.updateBotUserStep(telegramId, "env_confirm", { photo_url: photoUrl });
      await bot.sendMessage(chatId, `Confirmá si los datos son correctos:\n\nMinisterio: ${session.ministry_name}\nMentor: ${session.mentor_name}\nLíder: ${session.leader_name}\nPersonas: ${session.people_count}\nNuevo: ${session.is_new_person}\nOfrenda: ${session.offering}`, { reply_markup: siNoKeyboard });
    } else if (state === "env_confirm") {
      if (text === "SI") {
        await storage.createEnvelope({
          telegram_id: telegramId,
          user_name: getUserName(msg),
          ministry_name: session.ministry_name,
          mentor_name: session.mentor_name,
          leader_name: session.leader_name,
          people_count: session.people_count,
          is_new_person: session.is_new_person,
          offering: session.offering,
          photo_url: session.photo_url
        });
        await bot.sendMessage(chatId, "✅ Sobre cargado correctamente.", { reply_markup: mainKeyboard() });
      } else {
        await bot.sendMessage(chatId, "Proceso cancelado.", { reply_markup: mainKeyboard() });
      }
      await storage.updateBotUserStep(telegramId, null);
    }

    // --- FLOW: PRAYER ---
    else if (state === "prayer_request") {
        await storage.createRequest({
            telegram_id: telegramId,
            user_name: getUserName(msg),
            content: text
        });
        await storage.updateBotUserStep(telegramId, null);
        await sendNotificationEmail(
          `Nueva Petición de Oración - ${getUserName(msg)}`,
          `Petición: ${text}`
        );
        await bot.sendMessage(chatId, "🙏 Gracias por compartir tu petición.\nVamos a estar orando por vos 🤍", { reply_markup: mainKeyboard() });
    }

    // --- FLOW: NEW PERSON ---
    else if (state === "new_person_details") {
        await storage.createNewPerson({
            telegram_id: telegramId,
            recorded_by: getUserName(msg),
            details: text
        });
        await storage.updateBotUserStep(telegramId, null);
        await sendNotificationEmail(
          `Nueva Persona Registrada - ${getUserName(msg)}`,
          `Detalles: ${text}`
        );
        await bot.sendMessage(chatId, "✅ Persona nueva registrada correctamente.", { reply_markup: mainKeyboard() });
    }
  });

  return bot;
}
