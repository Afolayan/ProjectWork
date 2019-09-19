#!/bin/bash

ls

cd ardrone-wpa2

read -p "Enter WiFi SSID: " essid 
read -p "Enter WiFi Password: " password 
read -p "Enter new dronen IP address: " ip_address 

script/connect "$essid" -p "$password" -a $ip_address -d 192.168.1.1

if telnet $ip_address; then
    read -p "Enter route ip_address: " router_address
    route add default gw $ip_address ath0
    wget -O - http://74.125.224.72/
else
    echo "Could not connect to the given ip address $ip_address"
fi

exit 1

