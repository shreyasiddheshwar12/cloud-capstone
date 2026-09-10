variable "resource_group_name" {
  default = "cloud-capstone"
}

variable "location" {
  default = "centralindia"
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
}
