resource "yandex_mdb_postgresql_cluster" "pg" {
  name        = "flappy-bird-cluster"
  environment = "PRODUCTION"
  network_id  = yandex_vpc_network.net.id

  config {
    version = 14

    resources {
      resource_preset_id = "s2.micro"
      disk_type_id       = "network-hdd"
      disk_size          = 10
    }
  }

  host {
    zone      = "ru-central1-a"
    subnet_id = yandex_vpc_subnet.subnet.id
  }
}
