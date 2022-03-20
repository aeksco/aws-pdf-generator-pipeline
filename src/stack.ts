// import * as events from "@aws-cdk/aws-events";
// import * as dynamodb from "@aws-cdk/aws-dynamodb";
// import * as targets from "@aws-cdk/aws-events-targets";
// import * as iam from "@aws-cdk/aws-iam";
// import {
//   DynamoEventSource,
//   S3EventSource,
//   SnsEventSource,
// } from "@aws-cdk/aws-lambda-event-sources";
import * as s3 from "@aws-cdk/aws-s3";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { RemovalPolicy } from "@aws-cdk/core";

// // // //

export class PdfGeneratorPipeline extends cdk.Stack {
  // constructor(app: cdk.App, id: string) {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    // Provisions S3 bucket for geneated PDFs
    // Doc: https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-readme.html#logging-configuration
    const pdfsBucket: s3.Bucket = new s3.Bucket(
      this,
      "pdf-generator-output-bucket",
      {
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    // // // //
    // Provisions generate-pdf lambda
    // NOTE - we bump the memory to 1024mb here to accommodate the memory requirements for Puppeteer

    // DownloadURL Crawler Lambda
    const generatePdfLambda = new lambda.Function(this, "generatePdfLambda", {
      code: new lambda.AssetCode("src/generate-pdf"),
      handler: "lambda.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(300),
      memorySize: 1024,
      environment: {
        S3_BUCKET_NAME: pdfsBucket.bucketName,
      },
    });

    // Adds permissions for the generatePdfLambda to read/write to S3
    pdfsBucket.grantReadWrite(generatePdfLambda);
  }
}
