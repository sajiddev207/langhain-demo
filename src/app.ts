import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import * as dotenv from "dotenv";

dotenv.config();

const loader = new PDFLoader("src/documents/budget_speech.pdf");
console.log('loader__',loader);
const docs = await loader.load();
console.log('docs_____',docs);

// splitter function
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 20,
});
console.log('splitter____',splitter);

// created chunks from pdf
const splittedDocs = await splitter.splitDocuments(docs);
console.log('splittedDocs___',splittedDocs);
const embeddings = new OpenAIEmbeddings();

const vectorStore = await HNSWLib.fromDocuments(
  splittedDocs,
  embeddings
);

const vectorStoreRetriever = vectorStore.asRetriever();
const model = new OpenAI({
  modelName: 'gpt-3.5-turbo'
});

const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);

const question = 'What is age of sajid?';

const answer = await chain.call({
  query: question
});

console.log({
  question,
  answer
});

