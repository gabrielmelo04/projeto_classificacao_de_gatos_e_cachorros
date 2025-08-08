import dotenv from 'dotenv';
dotenv.config();

import fs, { read } from "fs";
import { createPartFromUri, createUserContent, GoogleGenAI, InlinedResponse, Type } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEN_AI_API_KEY });

const embeddings = JSON.parse(fs.readFileSync("../nearest_neighbors/embeddings.json"));

const testPaths = embeddings.filter(e => e["split"] == "test").map(e => "../nearest_neighbors/" + e["path"].slice(1)); // pegar no primeiro elemento para nao trazer train/

// console.log(testPaths);
// console.log(embeddings);

//Tirar a função const image = await genai.files.upload e colocar:
// function readImg(path){
//     return fs.readFileSync(path, { encoding: "base64" });
// }
// function inlineData(imgBase64){
//     return {
//         inlineData: {
//             mimeType: "image/jpeg",
//             data: imgBase64
//         }
//     }
// }
// console.log(inlineData(readImg(testPaths[0])));

// const imgInlineData = InlineData(readImg(testPaths[0]));
// const response = await genai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: [inlineData, `
//         Identifique se a imagem contém gatos ou cachorros. 
//         Retorne uma das seguintes categorias de acordo com o conteúdo da imagem: 
//         'cat' caso a imagem contenha um ou mais gatos, ou
//         'dog' caso a imagem contenha um ou mais cachorros

//         também retorne a cor do animal identificado.
//         `],
//     config: {
//         responseMimeType: "application/json", //retonar um json
//         responseSchema: {
//             type: Type.ARRAY,
//             items: {
//                 type: Type.OBJECT,
//                 properties: {
//                     category: { type: Type.STRING, enum: ["cat", "dog"] },
//                     color: { type: Type.STRING },
//                 },
//             },
//         }
//     }
// });

// async function geminiRequest(contents){
//     const response = await genai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: contents,
//         config: {
//             responseMimeType: "application/json", //retonar um json
//             responseSchema: {
//                 type: Type.ARRAY,
//                 items: {
//                     type: Type.OBJECT,
//                     properties: {
//                         category: { type: Type.STRING, enum: ["cat", "dog"] },
//                         color: { type: Type.STRING },
//                     },
//                 },
//             }
//         }
//     });
        // return response
// }

// async function llmClassifier(path){
//     const imgBase64 = readImg(path);
//     const imgInlineData = inlineData(imgBase64);
//     const contents = [imgInlineData, {text: `
//          Identifique se a imagem contém gatos ou cachorros. 
//          Retorne uma das seguintes categorias de acordo com o conteúdo da imagem: 
//          'cat' caso a imagem contenha um ou mais gatos, ou
//          'dog' caso a imagem contenha um ou mais cachorros

//          também retorne a cor do animal identificado.
//          `}]
//     const response = await geminiRequest(contents);

//     return JSON.parse(response.text)[0]["category"];
// }
// console.log(await llmClassifier(testPaths[0]));

const image = await genai.files.upload({
    file: testPaths[0], // é o path da imagem no valor do 0 posso colocar qualquer posição das imagens da pasta
    config: { mimeType: "image/jpeg" }
});

const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
        createPartFromUri(image.uri, image.mimeType),
        `
        Identifique se a imagem contém gatos ou cachorros. 
        Retorne uma das seguintes categorias de acordo com o conteúdo da imagem: 
        'cat' caso a imagem contenha um ou mais gatos, ou
        'dog' caso a imagem contenha um ou mais cachorros

        também retorne a cor do animal identificado.
        `
    ]),
    config: {
        responseMimeType: "application/json", //retonar um json
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, enum: ["cat", "dog"] },
                    color: { type: Type.STRING },
                },
            },
        }
    }
});

console.log(response.text);
