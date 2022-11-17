import { Schema } from "../src"

export const stringSchema = new Schema({
    stringField1: "string",
    stringField2: { type: "string" },
    stringField3: { type: "string", default: "S" },
    stringField4: { type: "string", required: true },
    stringField5: { type: "string", default: "SS", required: true }
})

export const numberSchema = new Schema({
    numberField1: "number",
    numberField2: { type: "number" },
    numberField3: { type: "number", default: 3 },
    numberField4: { type: "number", required: true },
    numberField5: { type: "number", default: 5, required: true }
})

export const booleanSchema = new Schema({
    booleanField1: "boolean",
    booleanField2: { type: "boolean" },
    booleanField3: { type: "boolean", default: true },
    booleanField4: { type: "boolean", required: true },
    booleanField5: { type: "boolean", default: false, required: true }
})

export const textSchema = new Schema({
    textField1: "text",
    textField2: { type: "text" },
    textField3: { type: "text", default: "T" },
    textField4: { type: "text", required: true },
    textField5: { type: "text", default: "TT", required: true }
})

export const dateSchema = new Schema({
    dateField1: "date",
    dateField2: { type: "date" },
    dateField3: { type: "date", default: 874195200000 },
    dateField4: { type: "date", required: true },
    dateField5: { type: "date", default: new Date(874195200000), required: true }
})