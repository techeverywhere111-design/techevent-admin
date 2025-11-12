/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { MoreVertical, User, Search, Download } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  planType: "Free" | "Personal" | "Business";
  dateJoined: string;
  avatar?: string;
}

const defaultClients: Client[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "25",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "26",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "27",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "28",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "29",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "2",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "3",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "5",
    name: "P Events",
    email: "plutoevents3@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "6",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "8",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "9",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "10",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "11",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "12",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "13",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "14",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "15",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "16",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "17",
    name: "Jane Doe",
    email: "janedoe123@gmail.com",
    planType: "Free",
    dateJoined: "20-07-2023",
  },
  {
    id: "18",
    name: "P Events",
    email: "randomemail@gmail.com",
    planType: "Business",
    dateJoined: "20-07-2023",
  },
  {
    id: "19",
    name: "John Smith",
    email: "johnsmith@gmail.com",
    planType: "Personal",
    dateJoined: "21-07-2023",
  },
  {
    id: "20",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "21",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "22",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "23",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
  {
    id: "24",
    name: "Jane Doe",
    email: "janedoe@outlook.com",
    planType: "Personal",
    dateJoined: "20-07-2023",
  },
];

const ClientManagement: React.FC = () => {
  const [clients] = useState<Client[]>(defaultClients);
  const [filteredClients, setFilteredClients] =
    useState<Client[]>(defaultClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-yellow-400",
      "bg-blue-400",
      "bg-green-400",
      "bg-purple-400",
      "bg-pink-400",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleSearch = () => {
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.planType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    // Optional: Search as you type
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        c.email.toLowerCase().includes(value.toLowerCase()) ||
        c.planType.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleExport = () => {
    console.log("Exporting clients...");
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleViewProfile = (client: Client) =>
    navigate(`/client-profile?${client.id}`);
  const handlePaymentHistory = (client: Client) =>
    navigate(`/clients/${client.id}/payments`);
  const handleAuditLogs = (client: Client) =>
    navigate(`/clients/${client.id}/audit-logs`);

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (value, _row: Client) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${getAvatarColor(
              value
            )} flex items-center justify-center`}
          >
            <User size={18} className="text-white" />
          </div>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">{v}</span>
      ),
    },
    { key: "planType", label: "Plan Type" },
    {
      key: "dateJoined",
      label: "Date Joined",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">{v}</span>
      ),
    },
  ];

  const renderActions = (row: Client) => (
    <div className="relative">
      <button
        onClick={() => toggleMenu(row.id)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {openMenuId === row.id && (
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 w-48">
          <button
            onClick={() => {
              handleViewProfile(row);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            View Profile
          </button>

          <button
            onClick={() => {
              handlePaymentHistory(row);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Payment History
          </button>

          <button
            onClick={() => {
              handleAuditLogs(row);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Audit Logs
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Clients Management
          </h1>
        </div>

        {/* Search & Export Section */}
        <div className="mb-6 flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        <Table
          columns={columns}
          data={filteredClients}
          itemsPerPage={10}
          renderActions={renderActions}
        />
      </div>
    </div>
  );
};

export default ClientManagement;
