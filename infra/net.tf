resource "yandex_vpc_network" "net" {
  name = "k8s-network"
}

resource "yandex_vpc_subnet" "subnet" {
  name           = "k8s-subnet"
  zone           = "ru-central1-a"
  network_id     = yandex_vpc_network.net.id
  v4_cidr_blocks = ["10.1.0.0/16"]
}
