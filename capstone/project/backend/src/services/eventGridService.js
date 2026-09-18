const { EventGridPublisherClient } =
  require("@azure/eventgrid");

const { AzureKeyCredential } =
  require("@azure/core-auth");

const client =
  new EventGridPublisherClient(
    process.env.EVENT_GRID_TOPIC_ENDPOINT,
    "EventGrid",
    new AzureKeyCredential(
      process.env.EVENT_GRID_ACCESS_KEY
    )
  );

async function publishRecallEvent(recall) {

  const event = {
    id: recall.recallId,

    subject: `Recall/${recall.recallId}`,

    eventType: "RecallPublished",

    eventTime: new Date(),

    dataVersion: "1.0",

    data: {
      recallId: recall.recallId,
      medicineCode: recall.medicineCode,
      batchNumber: recall.batchNumber,
      severity: recall.severity,
      status: "Published"
    }
  };

  await client.send([event]);
}

module.exports = {
  publishRecallEvent
};