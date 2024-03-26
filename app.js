require("dotenv").config();
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const ChatGPTClass = require("./chatgpt.class");
const { PROMP } = require("./promp");
const { init } = require("bot-ws-plugin-openai");
const { handlerAI } = require("./utils");

const chatGPTInstance = new ChatGPTClass();
const flowConfirmar = addKeyword("si confirmo").addAnswer(
  "continuamos con tu reserva"
);
let estado = false;

const flujoOn = addKeyword("prender")
  .addAction(async () => (estado = true))
  .addAnswer("Encendido");
const flujoOff = addKeyword("apagar")
  .addAction(async () => (estado = false))
  .addAnswer("Apagado");
const fakeHTTP = () => {
  return true;
};

const flowReservar = addKeyword("reservar")
  .addAnswer("Hola, ¿en qué puedo ayudarte?", null, async () => {
    await chatGPTInstance.handleMsgChatGPT(PROMP);
  })
  .addAnswer(
    "Para cuando quieres la cita ?",
    { capture: true },
    async (ctx, { fallBack }) => {
      const res = await chatGPTInstance.handleMsgChatGPT(ctx.body);
      const message = res.text;
      if (ctx.body.toLowerCase() !== "si confirmo") {
        return fallBack(message);
      }
    }
  );

const flowInicial = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, { flowDynamic }) => {
    await flowDynamic("Dame un momento, estoy procesando tu mensaje");
    const text = await handlerAI(ctx);
    await flowDynamic(text);
  }
);

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = await createFlow([flowInicial]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
