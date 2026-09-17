output "topic_id" {
  value = azurerm_eventgrid_topic.recall_events.id
}

output "topic_endpoint" {
  value = azurerm_eventgrid_topic.recall_events.endpoint
}