
import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";

// Using polling by default for simplicity in Replit dev environment
// In production, one might want to use Webhooks, but Polling works fine for this scale.
const token = process.env.TELEGRAM_TOKEN || "8503063564:AAEWJNmL7i8GK8xcdsm3KYoFKWApsE-pw24";

let bot: TelegramBot;

export function startBot() {
  if (bot) return bot;

  console.log("Starting Telegram Bot...");
  // Create a bot that uses 'polling' to fetch new updates
  bot = new TelegramBot(token, { polling: true });

  // === KEYBOARDS ===
  const mainKeyboard = (isAdmin: boolean) => {
    const buttons = [];
    if (isAdmin) {
      buttons.push([{ text: "Consultar líderes" }]);
    }
    buttons.push([{ text: "Cargar sobre de espiga" }]);
    buttons.push([{ text: "🙏 Enviar petición de oración" }]);
    buttons.push([{ text: "Terminar" }]);
    return {
      keyboard: buttons,
      resize_keyboard: true,
    };
  };

  const cancelKeyboard = {
    keyboard: [[{ text: "Terminar" }]],
    resize_keyboard: true,
  };

  // === HELPERS ===
  const getUserName = (msg: TelegramBot.Message) => {
    return `${msg.from?.first_name || ""} ${msg.from?.last_name || ""}`.trim();
  };

  // === HANDLERS ===
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id.toString();
    const text = msg.text || "";
    const telegramId = msg.from?.id.toString() || "";

    if (!telegramId) return;

    // Ensure user exists
    let user = await storage.getBotUser(telegramId);
    if (!user) {
      user = await storage.createBotUser({
        telegram_id: telegramId,
        first_name: msg.from?.first_name,
        last_name: msg.from?.last_name,
        username: msg.from?.username,
      });
    }

    // GLOBAL COMMANDS
    if (text === "/start") {
      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, "Hola Soy BONI 🤍\n¿En qué te puedo ayudar hoy?", {
        reply_markup: mainKeyboard(user?.access_level === "admin"),
      });
      return;
    }

    if (text === "Terminar" || text === "❌ Cancelar") {
      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, "Proceso cancelado. Gracias por comunicarte con BONI 🙌", {
        reply_markup: mainKeyboard(user?.access_level === "admin"),
      });
      return;
    }

    if (text === "Esteban2025") {
      await storage.updateBotUserAccess(telegramId, "admin");
      await bot.sendMessage(chatId, "✅ Acceso de administrador concedido.", {
        reply_markup: mainKeyboard(true),
      });
      return;
    }

    const state = user?.step;
    const session = (user?.session_data as any) || {};

    // === MAIN MENU HANDLERS ===
    if (!state) {
      if (text === "Consultar líderes") {
        if (user?.access_level !== "admin") {
           await bot.sendMessage(chatId, "No tenés acceso a esta función.");
           return;
        }
        
        const ministries = await storage.getMinistries();
        const keyboard = {
            keyboard: [...ministries.map(m => [{ text: m.name }]), [{ text: "Terminar" }]],
            resize_keyboard: true
        };
        await storage.updateBotUserStep(telegramId, "consulting_ministry");
        await bot.sendMessage(chatId, "Seleccioná un ministerio:", { reply_markup: keyboard });
        return;
      }

      if (text === "Cargar sobre de espiga") {
        const ministries = await storage.getMinistries();
        const keyboard = {
            keyboard: [...ministries.map(m => [{ text: m.name }]), [{ text: "Terminar" }]],
            resize_keyboard: true
        };
        await storage.updateBotUserStep(telegramId, "envelope_ministry");
        await bot.sendMessage(chatId, "¿En qué ministerio estás liderando?", { reply_markup: keyboard });
        return;
      }

      if (text === "🙏 Enviar petición de oración") {
        await storage.updateBotUserStep(telegramId, "prayer_request");
        await bot.sendMessage(chatId, "🙏 ¿Cuál es el motivo de tu petición de oración?", { reply_markup: cancelKeyboard });
        return;
      }
      
      // Default fallback
      await bot.sendMessage(chatId, "No entendí ese comando. Usá el menú 👇", {
        reply_markup: mainKeyboard(user?.access_level === "admin"),
      });
      return;
    }

    // === FLOW: CONSULTAR LÍDERES ===
    if (state === "consulting_ministry") {
      const ministry = await storage.getMinistryByName(text);
      if (!ministry) {
         await bot.sendMessage(chatId, "Ministerio no encontrado. Seleccioná uno del teclado.");
         return;
      }
      
      const leaders = await storage.getLeaders(ministry.id);
      let msg = `👥 Líderes del ministerio ${ministry.name}:\n\n`;
      if (leaders.length === 0) msg += "No hay líderes registrados.";
      leaders.forEach(l => msg += `• ${l.name}\n`);
      
      if (ministry.whatsapp_link) {
          msg += `\n📲 [WhatsApp](${ministry.whatsapp_link})`;
      }

      await storage.updateBotUserStep(telegramId, null);
      await bot.sendMessage(chatId, msg, { 
          parse_mode: 'Markdown',
          reply_markup: mainKeyboard(user?.access_level === "admin") 
      });
      return;
    }

    // === FLOW: PETICIÓN DE ORACIÓN ===
    if (state === "prayer_request") {
        await storage.createRequest({
            telegram_id: telegramId,
            user_name: getUserName(msg),
            content: text
        });
        
        await storage.updateBotUserStep(telegramId, null);
        await bot.sendMessage(chatId, "🙏 Gracias por compartir tu petición.\nVamos a estar orando por vos 🤍", {
            reply_markup: mainKeyboard(user?.access_level === "admin")
        });
        return;
    }

    // === FLOW: CARGAR SOBRE DE ESPIGA ===
    if (state === "envelope_ministry") {
        await storage.updateBotUserStep(telegramId, "envelope_mentor", { ministry_name: text });
        await bot.sendMessage(chatId, "¿Quién es tu mentor?", { reply_markup: cancelKeyboard });
        return;
    }

    if (state === "envelope_mentor") {
        await storage.updateBotUserStep(telegramId, "envelope_leader", { mentor_name: text });
        await bot.sendMessage(chatId, "¿Quién es el líder que carga el sobre?", { reply_markup: cancelKeyboard });
        return;
    }

    if (state === "envelope_leader") {
        // Here we ideally validate against DB if the leader exists in the ministry
        // For now, let's accept it and ask for details/amount
        await storage.updateBotUserStep(telegramId, "envelope_details", { leader_name: text });
        await bot.sendMessage(chatId, "Ingresá el detalle del sobre (monto, observaciones, etc):", { reply_markup: cancelKeyboard });
        return;
    }

    if (state === "envelope_details") {
        await storage.createEnvelope({
            telegram_id: telegramId,
            user_name: getUserName(msg),
            ministry_name: session.ministry_name,
            mentor_name: session.mentor_name,
            leader_name: session.leader_name,
            details: text
        });

        await storage.updateBotUserStep(telegramId, null);
        await bot.sendMessage(chatId, "✅ Sobre cargado correctamente.", {
            reply_markup: mainKeyboard(user?.access_level === "admin")
        });
        return;
    }

  });
  
  console.log("Bot started!");
  return bot;
}
