variable "folder_id" {
  type        = string
  description = "Yandex Cloud folder ID"
}

variable "yc_token" {
  type        = string
  description = "Service account token for managing resources"
  sensitive   = true
}

variable "cloud_id" {
  type        = string
  description = "Yandex Cloud project ID"
}
