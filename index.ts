import * as cdk from "@aws-cdk/core";
import { PdfGeneratorPipeline } from "./src/stack";

// // // //

// Defines new CDK App
const app = new cdk.App();

// Instantiates the PdfGeneratorPipeline
new PdfGeneratorPipeline(app, "PdfGeneratorPipeline");
app.synth();
