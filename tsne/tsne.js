import TSNE from 'tsne-js';
import fs from "fs";
import { createObjectCsvWriter } from 'csv-writer';

let embeddings = JSON.parse(fs.readFileSync("../nearest_neighbors/embeddings.json"));

let tsneInput = [];

for(let embedding of embeddings){
    if(embedding["number"] >= 500 && embedding["number"] < 1000){
        tsneInput.push(embedding);
    }
}

// console.log(tsneInput.length);
// console.log(embeddings.length);
let model = new TSNE({
    dim: 2, //duas dimensões
    perplexity: 30.0,
    earlyExaggeration: 4.0,
    learningRate: 100,
    nIiter: 1000, // número de interações
    metric: "euclidean"
});

model.init({
    data: tsneInput.map(i => i["embedding"]),
    type: "dense",
});

model.run();

let output = model.getOutput();

//Converter para o csv
let csvOutput = [];
for(let i=0; i < tsneInput.length; i++){
    csvOutput.push({
        class : tsneInput[i]["class"] == "dog" ? "orange" : "blue",
        x: output[i][0],
        y: output[i][1]
    });
}

const csvWriter = createObjectCsvWriter({
    path: "./tsne_output.csv",
    header: [
        { id: "class", title: "color" },
        { id: "x", title: "x" },
        { id: "y", title: "y" },
    ],
});

await csvWriter.writeRecords(csvOutput);

console.log(csvOutput);

//Após executar o comando a cima, ir no site: plotly online :https://chart-studio.plotly.com/create/#/
//E importar o csv -> o que a gente criou tsne_output.csv