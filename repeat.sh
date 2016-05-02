#!/bin/bash

for i in {1..4}; do
  curl -H "Content-Type: application/json" -d '{"password":"thepass","method":"rateSatisfaction","args":{"isHappy":true},"value":0}' http://localhost:8000/users/oracle/bde10fdb31c8b7f17b7bcc57d402b4f355e7a817/contract/microAPI/27a2d478ec595617e5c49f9572f49f21b644c944/call
  sleep 5 
  echo "waiting..."
done
for i in {1..2}; do
  curl -H "Content-Type: application/json" -d '{"password":"thepass","method":"rateSatisfaction","args":{"isHappy":true},"value":0}' http://localhost:8000/users/oracle/bde10fdb31c8b7f17b7bcc57d402b4f355e7a817/contract/microAPI/d95c212e7060188168325faf05719bd03bd23638/call
  sleep 5 
  echo "waiting..."
done
for i in {1..3}; do
  curl -H "Content-Type: application/json" -d '{"password":"thepass","method":"rateSatisfaction","args":{"isHappy":true},"value":0}' http://localhost:8000/users/oracle/bde10fdb31c8b7f17b7bcc57d402b4f355e7a817/contract/microAPI/27a2d478ec595617e5c49f9572f49f21b644c944/call
  sleep 5 
  echo "waiting..."
done
