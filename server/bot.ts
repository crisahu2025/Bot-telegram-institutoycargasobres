
import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";
import nodemailer from "nodemailer";

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_TOKEN is not defined in environment variables");
}

let bot: TelegramBot;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendNotificationEmail(subject: string, text: string) {
  try {
    const emailUser = process.env.EMAIL_USER || 'programacioniglesiagranrey@gmail.com';
    if (!emailUser) {
      console.warn("EMAIL_USER not set, skipping email notification");
      return;
    }
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
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

const HOREB_SUBJECTS: Record<string, string[]> = {
  "Primer Año": ["Epístolas Pastorales", "Evangelismo", "Introducción Bíblica - VIRTUAL", "Pentateuco I", "Evangelios Sinópticos I", "Dios – Jesucristo (T.S.I)"],
  "Segundo Año": ["Epístolas Generales - VIRTUAL", "Evangelios Sinópticos II", "Hogar Cristiano I", "Plantación de Iglesias I", "Pecado – Salvación (T.S.II)", "Pentateuco II"],
  "Tercer Año": ["Ángeles - Hombre – Biblia (T.S.III)", "Hechos", "Libros Históricos I", "Misiones I", "Teología Práctica I", "Escuela Bíblica - VIRTUAL", "Historia Eclesiástica I - VIRTUAL"],
  "Cuarto Año": ["Religiones Comparadas - VIRTUAL", "Pneumatología (T.S.IV)", "Dones y Ministerios", "Historia de los tiempos bíblicos", "Hermenéutica I", "Liderazgo", "Evangelio de Juan", "Homilética I - VIRTUAL"],
  "Quinto Año": ["Hogar Cristiano II", "Teología Práctica II", "Evidencias Cristianas", "Didáctica", "Epístolas Paulinas I", "Libros Poéticos I"],
  "Sexto Año": ["Pedagogía", "Romanos", "Libros Históricos II", "Profetas Mayores I", "Ética Cristiana", "Homilética II"],
  "Séptimo Año": ["Hebreos", "Teología Práctica III", "Plantación de Iglesias II", "Profetas Menores", "Libros Poéticos II", "Historia Eclesiástica II"],
  "Octavo Año": ["Misiones II", "Epístolas Paulinas II", "Teología Contemporánea", "Escatología – Eclesiología (T.S.V)", "Profetas Mayores II", "Daniel y Apocalipsis", "Hermenéutica II", "Introducción al Griego"]
};

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
      [{ text: "🎁 Donaciones / Ofrendas" }],
      [{ text: "Terminar" }]
    ],
    resize_keyboard: true,
  });

  const donationKeyboard = {
    keyboard: [
      [{ text: "Ver Alias y CBU" }],
      [{ text: "Ver Código QR" }],
      [{ text: "Terminar" }]
    ],
    resize_keyboard: true,
  };

  const cancelKeyboard = {
    keyboard: [[{ text: "Terminar" }]],
    resize_keyboard: true,
  };

  const siNoKeyboard = {
    keyboard: [[{ text: "SI" }], [{ text: "NO" }], [{ text: "Terminar" }]],
    resize_keyboard: true,
  };

  const yearsKeyboard = {
    keyboard: [
      [{ text: "Primer Año" }], [{ text: "Segundo Año" }], [{ text: "Tercer Año" }],
      [{ text: "Cuarto Año" }], [{ text: "Quinto Año" }], [{ text: "Sexto Año" }],
      [{ text: "Séptimo Año" }], [{ text: "Octavo Año" }], [{ text: "Terminar" }]
    ],
    resize_keyboard: true,
  };

  const getUserName = (msg: TelegramBot.Message) => {
    return `${msg.from?.first_name || ""} ${msg.from?.last_name || ""}`.trim();
  };

  bot.on("message", async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id.toString();
    const text = (msg.text || "").trim();
    const telegramId = msg.from?.id.toString() || "";
    const username = msg.from?.username || msg.from?.first_name || "Usuario";

    if (!telegramId || msg.from?.is_bot) return;

    let user = await storage.getBotUser(telegramId);
    if (!user) {
      try {
        user = await storage.createBotUser({
          telegram_id: telegramId,
          first_name: msg.from?.first_name,
          last_name: msg.from?.last_name,
          username: msg.from?.username,
        });
      } catch (e) {
        user = await storage.getBotUser(telegramId);
        if (!user) throw e;
      }
    }

    const displayName = user.username ? `@${user.username}` : `${user.first_name || ""} ${user.last_name || ""}`.trim() || telegramId;

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
        await bot.sendMessage(chatId, "¿En qué ministerio estás liderando?", { reply_markup: keyboard });
      } else if (text === "📚 Inscripción al Instituto Bíblico Horeb") {
        const keyboard = {
          keyboard: [
            [{ text: "Inscribirme al año completo" }],
            [{ text: "Añadir materias específicas" }],
            [{ text: "Carga del comprobante de pago del mes" }],
            [{ text: "Terminar" }]
          ],
          resize_keyboard: true
        };
        await storage.updateBotUserStep(telegramId, "inst_menu");
        await bot.sendMessage(chatId, "Seleccioná una opción del Instituto Horeb:", { reply_markup: keyboard });
      } else if (text === "🙏 Enviar petición de oración") {
        await storage.updateBotUserStep(telegramId, "prayer_request");
        await bot.sendMessage(chatId, "🙏 ¿Cuál es el motivo de tu petición de oración?", { reply_markup: cancelKeyboard });
      } else if (text === "NUEVOS DE ESPIGAS") {
        await storage.updateBotUserStep(telegramId, "new_person_details");
        await bot.sendMessage(chatId, "Decime los detalles de la persona nueva:", { reply_markup: cancelKeyboard });
      } else if (text === "🎁 Donaciones / Ofrendas") {
        await bot.sendMessage(chatId, "Gracias por tu generosidad. Elegí una opción:", { reply_markup: donationKeyboard });
      } else if (text === "Ver Alias y CBU") {
        await bot.sendMessage(chatId, "📍 *Datos para transferencia:*\n\n*Alias:* iglesia.espigas.horeb\n*CBU:* 0000003100012345678901\n*Banco:* Banco Provincia", { parse_mode: "Markdown" });
      } else if (text === "Ver Código QR") {
        await bot.sendMessage(chatId, "📸 *Escaneá el código QR para donar:*\n\n(Aquí aparecerá el código QR real próximamente)", { parse_mode: "Markdown" });
      }
      return;
    }

    // --- FLOW: ENVELOPE (SOBRES) ---
    if (state === "env_ministry") {
      await storage.updateBotUserStep(telegramId, "env_mentor", { ministry_name: text });
      await bot.sendMessage(chatId, "¿Quién es tu mentor?", { reply_markup: cancelKeyboard });
    } else if (state === "env_mentor") {
      await storage.updateBotUserStep(telegramId, "env_lider", { mentor_name: text });
      await bot.sendMessage(chatId, "¿Quién es el líder que carga el sobre?", { reply_markup: cancelKeyboard });
    } else if (state === "env_lider") {
      await storage.updateBotUserStep(telegramId, "env_attendance", { leader_name: text });
      await bot.sendMessage(chatId, "Nombre de las personas que asistieron\n\nEj: Juan Pérez, Gustavo Ramirez y Claudio Espinosa", { reply_markup: cancelKeyboard });
    } else if (state === "env_attendance") {
      await storage.updateBotUserStep(telegramId, "env_prayer_motive", { people_count: text });
      await bot.sendMessage(chatId, "Durante la espiga se pidió un motivo de oración\n\nEj: Juan Pérez por trabajo\n\nEj: Ninguno", { reply_markup: cancelKeyboard });
    } else if (state === "env_prayer_motive") {
      await storage.updateBotUserStep(telegramId, "env_offering", { prayer_motive: text });
      await bot.sendMessage(chatId, "¿Cuánto fue el monto de ofrenda? (solo números, ej: 5000)", { reply_markup: cancelKeyboard });
    } else if (state === "env_offering") {
      await storage.updateBotUserStep(telegramId, "env_photo", { offering: text });
      await bot.sendMessage(chatId, "Subí la foto del sobre de espiga.", { reply_markup: cancelKeyboard });
    } else if (state === "env_photo" && msg.photo) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const photoUrl = await bot.getFileLink(photoId);
      await storage.updateBotUserStep(telegramId, "env_confirm", { photo_url: photoUrl });
      await bot.sendMessage(chatId, `Confirmá si los datos son correctos:\n\nMinisterio: ${session.ministry_name}\nMentor: ${session.mentor_name}\nAsistencia: ${session.people_count}\nMotivo: ${session.prayer_motive}\nOfrenda: ${session.offering}`, { reply_markup: siNoKeyboard });
    } else if (state === "env_confirm") {
      if (text === "SI") {
        await storage.createEnvelope({
          telegram_id: telegramId,
          user_name: getUserName(msg),
          ministry_name: session.ministry_name,
          mentor_name: session.mentor_name,
          people_count: session.people_count,
          offering: session.offering,
          photo_url: session.photo_url
        });
        await bot.sendMessage(chatId, "✅ Sobre de espiga cargada con éxito.\nGracias por tu fidelidad 🙏", { reply_markup: mainKeyboard() });
      } else {
        await bot.sendMessage(chatId, "Proceso cancelado.", { reply_markup: mainKeyboard() });
      }
      await storage.updateBotUserStep(telegramId, null);
    }

    // --- FLOW: INSTITUTE (INSTITUTO) ---
    else if (state === "inst_menu") {
      if (text === "Inscribirme al año completo") {
        await storage.updateBotUserStep(telegramId, "inst_name", { inst_flow: "full_year" });
        await bot.sendMessage(chatId, "Apellido y nombre completo del alumno:", { reply_markup: cancelKeyboard });
      } else if (text === "Añadir materias específicas") {
        await storage.updateBotUserStep(telegramId, "inst_name", { inst_flow: "subjects" });
        await bot.sendMessage(chatId, "Apellido y nombre completo del alumno (exacto al que te inscribiste):", { reply_markup: cancelKeyboard });
      } else if (text === "Carga del comprobante de pago del mes") {
        await storage.updateBotUserStep(telegramId, "inst_pay_name", { inst_flow: "pay" });
        await bot.sendMessage(chatId, "Apellido y nombre completo del alumno:", { reply_markup: cancelKeyboard });
      }
    } else if (state === "inst_name") {
      await storage.updateBotUserStep(telegramId, "inst_year_select", { full_name: text });
      await bot.sendMessage(chatId, "¿De qué año vas a elegir?", { reply_markup: yearsKeyboard });
    } else if (state === "inst_year_select") {
      if (session.inst_flow === "full_year") {
        const yearSubjects = HOREB_SUBJECTS[text] || [];
        await storage.updateBotUserStep(telegramId, "inst_matr_q", { main_year: text, subjects: yearSubjects.join(", ") });
        await bot.sendMessage(chatId, `Se añadirán todas las materias de ${text}. ¿Pagaste la matrícula anual?`, { reply_markup: siNoKeyboard });
      } else {
        const yearSubjects = HOREB_SUBJECTS[text] || [];
        const keyboard = {
          keyboard: [...yearSubjects.map(s => [{ text: s }]), [{ text: "Terminar" }]],
          resize_keyboard: true
        };
        await storage.updateBotUserStep(telegramId, "inst_subjects_pick", { main_year: text });
        await bot.sendMessage(chatId, "Seleccioná la materia:", { reply_markup: keyboard });
      }
    } else if (state === "inst_subjects_pick") {
      await storage.updateBotUserStep(telegramId, "inst_matr_q", { subjects: text });
      await bot.sendMessage(chatId, "¿Pagaste la matrícula anual?", { reply_markup: siNoKeyboard });
    } else if (state === "inst_matr_q") {
      if (text === "SI") {
        await storage.updateBotUserStep(telegramId, "inst_photo_monthly", { paid_registration: "SI" });
        await bot.sendMessage(chatId, "Cargá el comprobante de pago del mes:", { reply_markup: cancelKeyboard });
      } else {
        await storage.updateBotUserStep(telegramId, "inst_photo_reg", { paid_registration: "NO" });
        await bot.sendMessage(chatId, "Cargá el comprobante de la matrícula:", { reply_markup: cancelKeyboard });
      }
    } else if (state === "inst_photo_reg" && msg.photo) {
      const photoUrl = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
      await storage.updateBotUserStep(telegramId, "inst_photo_monthly", { photo_registration: photoUrl });
      await bot.sendMessage(chatId, "Cargá el comprobante de pago del mes:", { reply_markup: cancelKeyboard });
    } else if (state === "inst_photo_monthly" && msg.photo) {
      const photoUrl = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
      await storage.createEnrollment({
        full_name: session.full_name,
        main_year: session.main_year,
        subjects: session.subjects,
        paid_registration: session.paid_registration,
        photo_registration: session.photo_registration || "",
        photo_monthly: photoUrl,
        telegram_id: telegramId,
        user_name: getUserName(msg)
      });
      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, "✅ Proceso completado exitosamente.", { reply_markup: mainKeyboard() });
    } else if (state === "inst_pay_name") {
      await storage.updateBotUserStep(telegramId, "inst_pay_photo", { full_name: text });
      await bot.sendMessage(chatId, "Cargá el comprobante de pago del mes:", { reply_markup: cancelKeyboard });
    } else if (state === "inst_pay_photo" && msg.photo) {
      const photoUrl = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
      await storage.createPayment({
        full_name: session.full_name,
        photo_monthly: photoUrl,
        telegram_id: telegramId,
        user_name: getUserName(msg)
      });
      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, "✅ Comprobante de pago guardado correctamente.", { reply_markup: mainKeyboard() });
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
