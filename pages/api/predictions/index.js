import { NextResponse } from "next/server";
import Replicate from "replicate";
import packageData from "../../../package.json";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: `${packageData.name}/${packageData.version}`,
});

async function getObjectFromRequestBodyStream(body) {
  const input = await body.getReader().read();
  const decoder = new TextDecoder();
  const string = decoder.decode(input.value);
  return JSON.parse(string);
}

const getBase64Image = async (src) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const dataURL = canvas.toDataURL("image/png");
      console.log('---getBase64Image', dataURL);
      resolve(dataURL);
    };
  });
};

const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

export default async function handler(req) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const input = await getObjectFromRequestBodyStream(req.body);

  // https://replicate.com/rossjillian/controlnet

const model = "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478";


  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });


const output = await replicate.run(model, { input });


  return NextResponse.json({
    images: output
  }, { status: 200 });
}

export const config = {
  runtime: "edge",
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
