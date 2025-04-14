import { Prisma } from '@prisma/client';
import { UserService } from './user/user.service';
import { DatabaseService } from './database/database.service';

const databaseService = new DatabaseService();
const userService = new UserService(databaseService);

async function main() {
    // const users: Prisma.UserCreateInput[] = 
    // [
    //   {
    //     "id": "E001",
    //     "name": "Joseph Kim",
    //     "role": "Kitchen Staff",
    //     "password": "password1",
    //     "dob": "1983-02-15",
    //     "telephone": "4911249283",
    //     "gender": "Female",
    //     "address": "435 Elizabeth Stravenue, Williamsland, CA 32888",
    //     "email": "christianmark@sanders-lopez.com"
    //   },
    //   {
    //     "id": "E002",
    //     "name": "Maria Terry",
    //     "role": "Inventory Manager",
    //     "password": "password2",
    //     "dob": "2001-04-12",
    //     "telephone": "7463087835",
    //     "gender": "Female",
    //     "address": "3259 Kim Keys, West Charlotteborough, LA 26562",
    //     "email": "sandra21@francis.biz"
    //   },
    //   {
    //     "id": "E003",
    //     "name": "Stacey Stephenson",
    //     "role": "QA Engineer",
    //     "password": "password3",
    //     "dob": "1966-03-20",
    //     "telephone": "5923489600",
    //     "gender": "Male",
    //     "address": "36659 Robert Track, Zacharyhaven, NH 55991",
    //     "email": "patrickvazquez@gmail.com"
    //   },
    //   {
    //     "id": "E004",
    //     "name": "Mary Sampson",
    //     "role": "HR Manager",
    //     "password": "password4",
    //     "dob": "2000-08-21",
    //     "telephone": "9457846914",
    //     "gender": "Male",
    //     "address": "63511 Silva Roads Suite 627, West Brentstad, PA 18380",
    //     "email": "juan20@gmail.com"
    //   },
    //   {
    //     "id": "E005",
    //     "name": "Laurie Medina",
    //     "role": "QA Engineer",
    //     "password": "password5",
    //     "dob": "1982-03-31",
    //     "telephone": "9878484628",
    //     "gender": "Female",
    //     "address": "60786 Matthew Dale Apt. 610, Port Kaitlyn, MA 81646",
    //     "email": "robertbaker@yahoo.com"
    //   },
    //   {
    //     "id": "E006",
    //     "name": "Jonathan Jones II",
    //     "role": "HR Manager",
    //     "password": "password6",
    //     "dob": "1970-12-21",
    //     "telephone": "4302513552",
    //     "gender": "Male",
    //     "address": "62599 William Drives, South Martinchester, NJ 61995",
    //     "email": "raymond26@yahoo.com"
    //   },
    //   {
    //     "id": "E007",
    //     "name": "Nina Fuller",
    //     "role": "QA Engineer",
    //     "password": "password7",
    //     "dob": "1992-08-20",
    //     "telephone": "2006980104",
    //     "gender": "Female",
    //     "address": "792 John Manor Suite 212, East Jeremymouth, SC 32526",
    //     "email": "ysalazar@perez.com"
    //   },
    //   {
    //     "id": "E008",
    //     "name": "Jessica Miles",
    //     "role": "Kitchen Staff",
    //     "password": "password8",
    //     "dob": "1982-01-14",
    //     "telephone": "9181744818",
    //     "gender": "Female",
    //     "address": "753 Alyssa Freeway Suite 392, Jessicashire, NE 09690",
    //     "email": "jwebb@mann.info"
    //   },
    //   {
    //     "id": "E009",
    //     "name": "Nicole Miller",
    //     "role": "Kitchen Staff",
    //     "password": "password9",
    //     "dob": "1981-02-18",
    //     "telephone": "5190886341",
    //     "gender": "Female",
    //     "address": "55161 Lindsey Union, East Sandramouth, MI 95907",
    //     "email": "natalie30@elliott.com"
    //   },
    //   {
    //     "id": "E010",
    //     "name": "Larry Bright",
    //     "role": "Kitchen Staff",
    //     "password": "password10",
    //     "dob": "1965-10-17",
    //     "telephone": "3052431757",
    //     "gender": "Male",
    //     "address": "66743 Christine Orchard, Wrightfort, NM 25078",
    //     "email": "amber36@yahoo.com"
    //   },
    //   {
    //     "id": "E011",
    //     "name": "Jennifer Fisher",
    //     "role": "QA Engineer",
    //     "password": "password11",
    //     "dob": "1994-03-05",
    //     "telephone": "4309294386",
    //     "gender": "Male",
    //     "address": "PSC 9160, Box 6932, APO AE 47608",
    //     "email": "jeffery33@hahn-carr.com"
    //   },
    //   {
    //     "id": "E012",
    //     "name": "Ann Schultz",
    //     "role": "Software Engineer",
    //     "password": "password12",
    //     "dob": "2002-10-17",
    //     "telephone": "8102579583",
    //     "gender": "Female",
    //     "address": "6312 Christopher Freeway, Lake Brittany, CT 96743",
    //     "email": "dsanchez@harper.com"
    //   },
    //   {
    //     "id": "E013",
    //     "name": "Mark Walter",
    //     "role": "Inventory Manager",
    //     "password": "password13",
    //     "dob": "1976-11-28",
    //     "telephone": "0376152880",
    //     "gender": "Male",
    //     "address": "90609 Terry Stravenue Suite 316, Websterport, GA 30426",
    //     "email": "heather85@gonzalez.biz"
    //   },
    //   {
    //     "id": "E014",
    //     "name": "Manuel Walter",
    //     "role": "Kitchen Admin",
    //     "password": "password14",
    //     "dob": "1992-05-15",
    //     "telephone": "5850439580",
    //     "gender": "Male",
    //     "address": "08267 Soto Isle Apt. 133, New Coreyberg, CA 24032",
    //     "email": "rhondagoodman@yahoo.com"
    //   },
    //   {
    //     "id": "E015",
    //     "name": "Christopher Oliver III",
    //     "role": "QA Engineer",
    //     "password": "password15",
    //     "dob": "1994-11-28",
    //     "telephone": "3200863374",
    //     "gender": "Male",
    //     "address": "99874 Christopher Track Apt. 412, Port Johnburgh, MS 02630",
    //     "email": "amberfrazier@yahoo.com"
    //   },
    //   {
    //     "id": "E016",
    //     "name": "Steven Banks",
    //     "role": "Kitchen Staff",
    //     "password": "password16",
    //     "dob": "1976-11-11",
    //     "telephone": "4179552857",
    //     "gender": "Female",
    //     "address": "7616 Holly Dale, East Brookestad, NJ 21349",
    //     "email": "pattonjessica@smith.com"
    //   },
    //   {
    //     "id": "E017",
    //     "name": "Tyler Underwood",
    //     "role": "Software Engineer",
    //     "password": "password17",
    //     "dob": "1987-10-08",
    //     "telephone": "7486400454",
    //     "gender": "Male",
    //     "address": "33698 Brian Isle Suite 881, Barnettview, WI 77933",
    //     "email": "carterjoshua@gmail.com"
    //   },
    //   {
    //     "id": "E018",
    //     "name": "James Chavez",
    //     "role": "Kitchen Admin",
    //     "password": "password18",
    //     "dob": "1979-12-25",
    //     "telephone": "1128951107",
    //     "gender": "Male",
    //     "address": "62012 Shah Trafficway, Kellyshire, WY 26945",
    //     "email": "dawn32@simpson.net"
    //   },
    //   {
    //     "id": "E019",
    //     "name": "Linda Hall",
    //     "role": "Kitchen Staff",
    //     "password": "password19",
    //     "dob": "1974-02-01",
    //     "telephone": "1675062918",
    //     "gender": "Female",
    //     "address": "Unit 7266 Box 9622, DPO AE 09111",
    //     "email": "fbanks@parker-brooks.com"
    //   },
    //   {
    //     "id": "E020",
    //     "name": "Anthony Robles",
    //     "role": "HR Manager",
    //     "password": "password20",
    //     "dob": "1985-10-13",
    //     "telephone": "2055719975",
    //     "gender": "Male",
    //     "address": "22371 Natalie View, Deborahberg, OK 51949",
    //     "email": "tyoung@rojas.biz"
    //   },
    //   {
    //     "id": "E021",
    //     "name": "Dr. Jonathan Cunningham",
    //     "role": "Kitchen Admin",
    //     "password": "password21",
    //     "dob": "1984-08-11",
    //     "telephone": "1824746724",
    //     "gender": "Female",
    //     "address": "2523 Robert Square Apt. 218, Port Amystad, SC 03142",
    //     "email": "paigemontgomery@hotmail.com"
    //   },
    //   {
    //     "id": "E022",
    //     "name": "Christina Walsh",
    //     "role": "Software Engineer",
    //     "password": "password22",
    //     "dob": "1986-02-09",
    //     "telephone": "3489052101",
    //     "gender": "Male",
    //     "address": "8661 Amber Crescent Apt. 707, Samuelberg, CA 00752",
    //     "email": "baileyle@hotmail.com"
    //   },
    //   {
    //     "id": "E023",
    //     "name": "Stephen Ellis",
    //     "role": "Kitchen Admin",
    //     "password": "password23",
    //     "dob": "1986-11-01",
    //     "telephone": "0642285152",
    //     "gender": "Male",
    //     "address": "42577 Garrett Route Suite 470, Smithfurt, NM 64550",
    //     "email": "nancygillespie@lee-walter.org"
    //   },
    //   {
    //     "id": "E024",
    //     "name": "Alyssa Kennedy",
    //     "role": "Software Engineer",
    //     "password": "password24",
    //     "dob": "1982-07-18",
    //     "telephone": "7342776367",
    //     "gender": "Male",
    //     "address": "124 Davis Drive Suite 822, North Heatherborough, ND 06559",
    //     "email": "johnsoneric@gonzalez-mueller.net"
    //   },
    //   {
    //     "id": "E025",
    //     "name": "April Murphy",
    //     "role": "Kitchen Admin",
    //     "password": "password25",
    //     "dob": "1991-11-26",
    //     "telephone": "3892510563",
    //     "gender": "Female",
    //     "address": "USNV Simpson, FPO AE 87819",
    //     "email": "lscott@fleming.com"
    //   },
    //   {
    //     "id": "E026",
    //     "name": "Brandi Blake",
    //     "role": "Kitchen Staff",
    //     "password": "password26",
    //     "dob": "2004-06-21",
    //     "telephone": "2989830623",
    //     "gender": "Female",
    //     "address": "4444 Audrey Mission Apt. 266, North Joseborough, AZ 19499",
    //     "email": "lesliemitchell@gmail.com"
    //   },
    //   {
    //     "id": "E027",
    //     "name": "Bailey Wilkinson",
    //     "role": "Software Engineer",
    //     "password": "password27",
    //     "dob": "2004-10-03",
    //     "telephone": "8534838815",
    //     "gender": "Female",
    //     "address": "650 Elliott Light Suite 548, East Christina, FL 75989",
    //     "email": "wilsonmichelle@larson.com"
    //   },
    //   {
    //     "id": "E028",
    //     "name": "Cheryl Wilson",
    //     "role": "Kitchen Staff",
    //     "password": "password28",
    //     "dob": "1980-03-25",
    //     "telephone": "4865092380",
    //     "gender": "Female",
    //     "address": "20952 David Roads Apt. 405, Michaelberg, UT 07100",
    //     "email": "ohawkins@yahoo.com"
    //   },
    //   {
    //     "id": "E029",
    //     "name": "Danielle Donovan",
    //     "role": "Inventory Manager",
    //     "password": "password29",
    //     "dob": "1993-04-21",
    //     "telephone": "9811503685",
    //     "gender": "Male",
    //     "address": "07138 Hopkins Pines Apt. 882, West William, MI 15908",
    //     "email": "wmartin@gmail.com"
    //   },
    //   {
    //     "id": "E030",
    //     "name": "Raymond Jefferson",
    //     "role": "Kitchen Staff",
    //     "password": "password30",
    //     "dob": "1969-09-27",
    //     "telephone": "7247670654",
    //     "gender": "Female",
    //     "address": "PSC 0800, Box 7398, APO AP 84712",
    //     "email": "bruce67@wolfe.com"
    //   },
    //   {
    //     "id": "E031",
    //     "name": "Christian Stark",
    //     "role": "Software Engineer",
    //     "password": "password31",
    //     "dob": "1994-09-28",
    //     "telephone": "4112391866",
    //     "gender": "Male",
    //     "address": "6818 Stephanie Bridge Suite 031, New Sherrimouth, DC 17226",
    //     "email": "juarezjoseph@gmail.com"
    //   },
    //   {
    //     "id": "E032",
    //     "name": "Sarah Baker",
    //     "role": "Kitchen Admin",
    //     "password": "password32",
    //     "dob": "1970-01-19",
    //     "telephone": "9495803955",
    //     "gender": "Male",
    //     "address": "6489 Jennifer Vista, Port Kristaland, MD 54754",
    //     "email": "mccannjuan@cook-peters.com"
    //   },
    //   {
    //     "id": "E033",
    //     "name": "Peter Brown",
    //     "role": "Inventory Manager",
    //     "password": "password33",
    //     "dob": "1982-12-25",
    //     "telephone": "5222902138",
    //     "gender": "Male",
    //     "address": "Unit 9794 Box 8693, DPO AA 63020",
    //     "email": "mooredanielle@middleton.org"
    //   },
    //   {
    //     "id": "E034",
    //     "name": "Nicole Kirby",
    //     "role": "QA Engineer",
    //     "password": "password34",
    //     "dob": "1987-04-14",
    //     "telephone": "3985136549",
    //     "gender": "Female",
    //     "address": "USNV Nichols, FPO AE 90349",
    //     "email": "moorejesus@yahoo.com"
    //   },
    //   {
    //     "id": "E035",
    //     "name": "Isabella Stokes",
    //     "role": "QA Engineer",
    //     "password": "password35",
    //     "dob": "1984-06-14",
    //     "telephone": "3762196438",
    //     "gender": "Female",
    //     "address": "8780 Kathleen Walks, South Christineberg, VA 64365",
    //     "email": "mooneybrian@hotmail.com"
    //   },
    //   {
    //     "id": "E036",
    //     "name": "Rachel Hunt",
    //     "role": "Kitchen Admin",
    //     "password": "password36",
    //     "dob": "1979-09-08",
    //     "telephone": "8561487319",
    //     "gender": "Female",
    //     "address": "0833 Cynthia Port, South Jennifer, NE 11726",
    //     "email": "loveann@matthews.com"
    //   },
    //   {
    //     "id": "E037",
    //     "name": "Christopher Holden",
    //     "role": "Software Engineer",
    //     "password": "password37",
    //     "dob": "1987-05-07",
    //     "telephone": "0340994042",
    //     "gender": "Male",
    //     "address": "6717 Moore Corners, Brownburgh, OH 82848",
    //     "email": "gina86@hart.com"
    //   },
    //   {
    //     "id": "E038",
    //     "name": "Donna Contreras",
    //     "role": "Software Architect",
    //     "password": "password38",
    //     "dob": "1998-02-17",
    //     "telephone": "5960249776",
    //     "gender": "Male",
    //     "address": "7624 Brian Road Suite 539, North Karenburgh, AL 35999",
    //     "email": "youngroy@gmail.com"
    //   },
    //   {
    //     "id": "E039",
    //     "name": "Michael Fletcher",
    //     "role": "Inventory Manager",
    //     "password": "password39",
    //     "dob": "2002-04-05",
    //     "telephone": "1800041542",
    //     "gender": "Male",
    //     "address": "3780 Michele Camp Apt. 512, South Staceyville, OK 94384",
    //     "email": "ellisluis@reese-bradford.com"
    //   },
    //   {
    //     "id": "E040",
    //     "name": "Dr. Dawn Gibson",
    //     "role": "HR Manager",
    //     "password": "password40",
    //     "dob": "1996-01-02",
    //     "telephone": "1091944965",
    //     "gender": "Female",
    //     "address": "PSC 7202, Box 9212, APO AP 20187",
    //     "email": "anthony68@gmail.com"
    //   },
    //   {
    //     "id": "E041",
    //     "name": "Kathleen Stevens",
    //     "role": "HR Manager",
    //     "password": "password41",
    //     "dob": "2003-12-24",
    //     "telephone": "1780755239",
    //     "gender": "Female",
    //     "address": "93832 Tiffany Roads, North Jenniferchester, HI 14386",
    //     "email": "garciakathy@gmail.com"
    //   },
    //   {
    //     "id": "E042",
    //     "name": "Sean Washington",
    //     "role": "Kitchen Staff",
    //     "password": "password42",
    //     "dob": "1990-07-08",
    //     "telephone": "6053650951",
    //     "gender": "Male",
    //     "address": "33117 Hughes Spring Apt. 102, East Susan, FL 38890",
    //     "email": "duncanchristopher@hawkins-lamb.com"
    //   },
    //   {
    //     "id": "E043",
    //     "name": "Timothy Romero",
    //     "role": "HR Manager",
    //     "password": "password43",
    //     "dob": "1982-04-02",
    //     "telephone": "6814258004",
    //     "gender": "Male",
    //     "address": "186 Thomas Mission, Campbellburgh, WI 21988",
    //     "email": "oparker@gmail.com"
    //   },
    //   {
    //     "id": "E044",
    //     "name": "Derrick Kelley",
    //     "role": "Kitchen Staff",
    //     "password": "password44",
    //     "dob": "1994-05-23",
    //     "telephone": "4416526498",
    //     "gender": "Male",
    //     "address": "9152 George Center Suite 807, Lake Reginaldchester, OH 99635",
    //     "email": "patrick00@yahoo.com"
    //   },
    //   {
    //     "id": "E045",
    //     "name": "Anne Leonard",
    //     "role": "QA Engineer",
    //     "password": "password45",
    //     "dob": "2002-02-24",
    //     "telephone": "8848804738",
    //     "gender": "Female",
    //     "address": "50953 Ariel Lane, Scotthaven, NV 57121",
    //     "email": "alyssa37@coleman-fernandez.com"
    //   },
    //   {
    //     "id": "E046",
    //     "name": "Tina Johns",
    //     "role": "Software Engineer",
    //     "password": "password46",
    //     "dob": "1998-11-02",
    //     "telephone": "6676572744",
    //     "gender": "Male",
    //     "address": "64054 Daniel Burgs Suite 227, Christinaburgh, WA 44020",
    //     "email": "william94@yahoo.com"
    //   },
    //   {
    //     "id": "E047",
    //     "name": "Keith Wright",
    //     "role": "Kitchen Staff",
    //     "password": "password47",
    //     "dob": "2004-08-30",
    //     "telephone": "6130352562",
    //     "gender": "Female",
    //     "address": "41574 Thornton Ridges Suite 412, Port Ericfurt, MT 90297",
    //     "email": "ginaross@waters.com"
    //   },
    //   {
    //     "id": "E048",
    //     "name": "Jonathan Rich",
    //     "role": "Software Architect",
    //     "password": "password48",
    //     "dob": "1997-12-16",
    //     "telephone": "9757438880",
    //     "gender": "Male",
    //     "address": "554 Romero Highway, Valenciaview, LA 15917",
    //     "email": "ewilson@hotmail.com"
    //   },
    //   {
    //     "id": "E049",
    //     "name": "Anne Peterson",
    //     "role": "Inventory Manager",
    //     "password": "password49",
    //     "dob": "1984-11-02",
    //     "telephone": "7536801736",
    //     "gender": "Female",
    //     "address": "9125 Sampson Track, Bryantland, MN 31819",
    //     "email": "kevin30@cooper-ramirez.info"
    //   },
    //   {
    //     "id": "E050",
    //     "name": "Robert Rodriguez",
    //     "role": "Kitchen Admin",
    //     "password": "password50",
    //     "dob": "1983-04-02",
    //     "telephone": "2797460123",
    //     "gender": "Male",
    //     "address": "750 Walker Turnpike Apt. 948, Port Matthewshire, MS 77609",
    //     "email": "jeansanders@rivera.org"
    //   },
    //   {
    //     "id": "E051",
    //     "name": "Amanda Campbell",
    //     "role": "HR Manager",
    //     "password": "password51",
    //     "dob": "1966-12-09",
    //     "telephone": "6003870397",
    //     "gender": "Female",
    //     "address": "902 Stone Roads, Brendashire, MN 97913",
    //     "email": "erinkelly@stafford-bernard.info"
    //   },
    //   {
    //     "id": "E052",
    //     "name": "Dr. Ryan Parker",
    //     "role": "QA Engineer",
    //     "password": "password52",
    //     "dob": "1978-06-07",
    //     "telephone": "2266025590",
    //     "gender": "Female",
    //     "address": "367 Ellis Cliffs, West Lindashire, GA 71987",
    //     "email": "sanchezwillie@yahoo.com"
    //   },
    //   {
    //     "id": "E053",
    //     "name": "Mrs. Melanie Romero",
    //     "role": "Software Architect",
    //     "password": "password53",
    //     "dob": "1990-03-30",
    //     "telephone": "4461096886",
    //     "gender": "Female",
    //     "address": "4561 Daniels Ville, Katherinechester, UT 75552",
    //     "email": "connor68@murphy-terrell.com"
    //   },
    //   {
    //     "id": "E054",
    //     "name": "Shane Wood",
    //     "role": "Software Engineer",
    //     "password": "password54",
    //     "dob": "1976-10-22",
    //     "telephone": "2694983101",
    //     "gender": "Male",
    //     "address": "263 Brian Skyway, Gabrielbury, NC 69255",
    //     "email": "tashawagner@hotmail.com"
    //   },
    //   {
    //     "id": "E055",
    //     "name": "Denise Hopkins",
    //     "role": "Kitchen Admin",
    //     "password": "password55",
    //     "dob": "1968-08-31",
    //     "telephone": "4640272726",
    //     "gender": "Male",
    //     "address": "9941 Katherine Mountain Suite 368, Gabrielton, VT 94757",
    //     "email": "salinasvalerie@yahoo.com"
    //   },
    //   {
    //     "id": "E056",
    //     "name": "Margaret Atkins",
    //     "role": "Inventory Manager",
    //     "password": "password56",
    //     "dob": "2001-02-21",
    //     "telephone": "8920552139",
    //     "gender": "Male",
    //     "address": "Unit 0245 Box 3543, DPO AP 04562",
    //     "email": "debrameyer@hotmail.com"
    //   },
    //   {
    //     "id": "E057",
    //     "name": "Joshua Becker DDS",
    //     "role": "QA Engineer",
    //     "password": "password57",
    //     "dob": "1997-02-02",
    //     "telephone": "2046603791",
    //     "gender": "Male",
    //     "address": "47759 Valenzuela Rapids, Jeremyfurt, WI 04544",
    //     "email": "hicksstephanie@yahoo.com"
    //   },
    //   {
    //     "id": "E058",
    //     "name": "David Campbell",
    //     "role": "Software Engineer",
    //     "password": "password58",
    //     "dob": "2003-03-01",
    //     "telephone": "7602860577",
    //     "gender": "Female",
    //     "address": "355 Day Camp, North Danielmouth, AZ 07204",
    //     "email": "kristenprice@yahoo.com"
    //   },
    //   {
    //     "id": "E059",
    //     "name": "Michael Burch",
    //     "role": "HR Manager",
    //     "password": "password59",
    //     "dob": "1995-06-03",
    //     "telephone": "4100137657",
    //     "gender": "Male",
    //     "address": "28777 Courtney Highway Apt. 552, Maysview, WY 65840",
    //     "email": "treeves@yang.org"
    //   },
    //   {
    //     "id": "E060",
    //     "name": "Jennifer Rivera",
    //     "role": "Software Engineer",
    //     "password": "password60",
    //     "dob": "1965-05-07",
    //     "telephone": "9612017542",
    //     "gender": "Female",
    //     "address": "41475 Patterson Mountain Apt. 684, East Andreaton, NJ 52101",
    //     "email": "qjones@gmail.com"
    //   },
    //   {
    //     "id": "E061",
    //     "name": "Peter Acosta",
    //     "role": "Kitchen Admin",
    //     "password": "password61",
    //     "dob": "1992-08-20",
    //     "telephone": "2216196634",
    //     "gender": "Female",
    //     "address": "300 Welch Trafficway Suite 551, Lake Wendytown, WV 40851",
    //     "email": "lisa29@gmail.com"
    //   },
    //   {
    //     "id": "E062",
    //     "name": "Amber Stephens",
    //     "role": "Inventory Manager",
    //     "password": "password62",
    //     "dob": "1972-06-21",
    //     "telephone": "2589942763",
    //     "gender": "Male",
    //     "address": "1722 Koch Mission Apt. 675, Buckleyton, DE 75787",
    //     "email": "tommy41@yahoo.com"
    //   },
    //   {
    //     "id": "E063",
    //     "name": "Sarah Morgan",
    //     "role": "Inventory Manager",
    //     "password": "password63",
    //     "dob": "1969-08-09",
    //     "telephone": "9030095516",
    //     "gender": "Male",
    //     "address": "573 Shawn Path, New Heatherbury, NV 47328",
    //     "email": "maryallen@yahoo.com"
    //   },
    //   {
    //     "id": "E064",
    //     "name": "Jaime Brady",
    //     "role": "Kitchen Staff",
    //     "password": "password64",
    //     "dob": "1965-01-27",
    //     "telephone": "5974874528",
    //     "gender": "Female",
    //     "address": "6733 Wagner Trail Suite 019, New Ethanland, RI 13478",
    //     "email": "qday@leonard.org"
    //   },
    //   {
    //     "id": "E065",
    //     "name": "Melissa Barnes",
    //     "role": "Inventory Manager",
    //     "password": "password65",
    //     "dob": "2004-03-12",
    //     "telephone": "3711228547",
    //     "gender": "Male",
    //     "address": "6356 Aaron Spurs Suite 105, New Kimberlyhaven, WI 51118",
    //     "email": "dturner@gmail.com"
    //   },
    //   {
    //     "id": "E066",
    //     "name": "Zachary Hogan",
    //     "role": "Inventory Manager",
    //     "password": "password66",
    //     "dob": "1965-11-05",
    //     "telephone": "3905747567",
    //     "gender": "Female",
    //     "address": "913 Brown Shore, West Hannahburgh, HI 61968",
    //     "email": "paula33@hotmail.com"
    //   },
    //   {
    //     "id": "E067",
    //     "name": "Shannon Hogan",
    //     "role": "Kitchen Staff",
    //     "password": "password67",
    //     "dob": "2000-12-07",
    //     "telephone": "5596036715",
    //     "gender": "Male",
    //     "address": "8286 Rebecca Spur, Traciland, MT 10005",
    //     "email": "wcunningham@moore.com"
    //   },
    //   {
    //     "id": "E068",
    //     "name": "Alexander Anderson",
    //     "role": "Kitchen Staff",
    //     "password": "password68",
    //     "dob": "1971-03-09",
    //     "telephone": "7540001567",
    //     "gender": "Male",
    //     "address": "611 George Views Suite 542, Rodriguezborough, AK 47604",
    //     "email": "jennifer26@perry-ray.info"
    //   },
    //   {
    //     "id": "E069",
    //     "name": "Stephanie Sexton",
    //     "role": "QA Engineer",
    //     "password": "password69",
    //     "dob": "1964-08-05",
    //     "telephone": "6606250176",
    //     "gender": "Female",
    //     "address": "69088 Emily Parkway Suite 144, East Keithfurt, VA 44663",
    //     "email": "sophia42@hotmail.com"
    //   },
    //   {
    //     "id": "E070",
    //     "name": "Richard Pugh",
    //     "role": "QA Engineer",
    //     "password": "password70",
    //     "dob": "1990-01-29",
    //     "telephone": "6951802150",
    //     "gender": "Male",
    //     "address": "USCGC Ortiz, FPO AP 37111",
    //     "email": "waltoncarl@yahoo.com"
    //   },
    //   {
    //     "id": "E071",
    //     "name": "Rebecca Rivas",
    //     "role": "Software Architect",
    //     "password": "password71",
    //     "dob": "1994-03-28",
    //     "telephone": "5593934475",
    //     "gender": "Female",
    //     "address": "533 Michael Common, Rodriguezshire, VA 16649",
    //     "email": "smoore@hotmail.com"
    //   },
    //   {
    //     "id": "E072",
    //     "name": "Lisa Jones",
    //     "role": "Kitchen Admin",
    //     "password": "password72",
    //     "dob": "1965-05-30",
    //     "telephone": "9700609148",
    //     "gender": "Female",
    //     "address": "201 Alicia Junction Suite 689, Lake Alexport, OK 65230",
    //     "email": "ystewart@freeman.com"
    //   },
    //   {
    //     "id": "E073",
    //     "name": "Jamie Jenkins",
    //     "role": "Inventory Manager",
    //     "password": "password73",
    //     "dob": "1996-12-01",
    //     "telephone": "0138635276",
    //     "gender": "Male",
    //     "address": "911 Carter Burgs, West David, MS 77161",
    //     "email": "williamsroy@yahoo.com"
    //   },
    //   {
    //     "id": "E074",
    //     "name": "Jose Johnson",
    //     "role": "Kitchen Staff",
    //     "password": "password74",
    //     "dob": "1967-05-01",
    //     "telephone": "0584801402",
    //     "gender": "Female",
    //     "address": "2271 Lee Ridge, Michaeltown, WA 47222",
    //     "email": "rsmith@graham.com"
    //   },
    //   {
    //     "id": "E075",
    //     "name": "James Oliver",
    //     "role": "Software Architect",
    //     "password": "password75",
    //     "dob": "1990-02-08",
    //     "telephone": "7378819681",
    //     "gender": "Female",
    //     "address": "41866 Samuel Shore Suite 936, New April, PA 86268",
    //     "email": "corey33@orozco-martinez.org"
    //   },
    //   {
    //     "id": "E076",
    //     "name": "Jenna Gilmore",
    //     "role": "Inventory Manager",
    //     "password": "password76",
    //     "dob": "1979-04-30",
    //     "telephone": "2487759754",
    //     "gender": "Female",
    //     "address": "06340 Mendez Hills Suite 373, North Jon, NH 59282",
    //     "email": "amyvillegas@gmail.com"
    //   },
    //   {
    //     "id": "E077",
    //     "name": "Dave Ramos",
    //     "role": "Software Architect",
    //     "password": "password77",
    //     "dob": "2003-08-07",
    //     "telephone": "2243809515",
    //     "gender": "Male",
    //     "address": "PSC 4785, Box 6906, APO AE 26944",
    //     "email": "belltracy@mack.com"
    //   },
    //   {
    //     "id": "E078",
    //     "name": "Logan Holloway",
    //     "role": "Software Engineer",
    //     "password": "password78",
    //     "dob": "1984-01-12",
    //     "telephone": "6194801224",
    //     "gender": "Female",
    //     "address": "556 Stephens Harbor Suite 345, East Kevinborough, MD 83644",
    //     "email": "bryan55@lawson.com"
    //   },
    //   {
    //     "id": "E079",
    //     "name": "Ashley Thomas",
    //     "role": "Kitchen Staff",
    //     "password": "password79",
    //     "dob": "1973-09-11",
    //     "telephone": "3806002097",
    //     "gender": "Male",
    //     "address": "5741 Thomas Spur, Port Marcuston, UT 23341",
    //     "email": "owenpeter@hotmail.com"
    //   },
    //   {
    //     "id": "E080",
    //     "name": "Jason Young",
    //     "role": "Kitchen Staff",
    //     "password": "password80",
    //     "dob": "1990-04-16",
    //     "telephone": "4006342074",
    //     "gender": "Male",
    //     "address": "7281 Baker Mills Apt. 478, Port Katherine, GA 49400",
    //     "email": "david35@yahoo.com"
    //   },
    //   {
    //     "id": "E081",
    //     "name": "Joseph Harmon",
    //     "role": "Kitchen Staff",
    //     "password": "password81",
    //     "dob": "1973-11-21",
    //     "telephone": "2446739996",
    //     "gender": "Male",
    //     "address": "854 Torres Fields, Blakeville, CA 23861",
    //     "email": "cindy03@hebert.net"
    //   },
    //   {
    //     "id": "E082",
    //     "name": "Michael Martinez",
    //     "role": "Software Engineer",
    //     "password": "password82",
    //     "dob": "2001-09-01",
    //     "telephone": "8601094820",
    //     "gender": "Female",
    //     "address": "1760 Riley Tunnel, West Deborahfurt, TX 31861",
    //     "email": "stevensherman@blackwell.net"
    //   },
    //   {
    //     "id": "E083",
    //     "name": "Christina Smith",
    //     "role": "QA Engineer",
    //     "password": "password83",
    //     "dob": "2002-01-04",
    //     "telephone": "7778194927",
    //     "gender": "Female",
    //     "address": "336 Davidson Mountains Apt. 281, Nancyport, PA 72068",
    //     "email": "kathleenperry@gmail.com"
    //   },
    //   {
    //     "id": "E084",
    //     "name": "Michael Vega",
    //     "role": "Software Engineer",
    //     "password": "password84",
    //     "dob": "2003-10-31",
    //     "telephone": "0768854857",
    //     "gender": "Male",
    //     "address": "8523 Bryan Course, Parkville, WI 65338",
    //     "email": "linda35@martinez-campbell.com"
    //   },
    //   {
    //     "id": "E085",
    //     "name": "Gina Vargas",
    //     "role": "Kitchen Admin",
    //     "password": "password85",
    //     "dob": "1969-03-19",
    //     "telephone": "0042260643",
    //     "gender": "Male",
    //     "address": "Unit 9398 Box 4672, DPO AP 31260",
    //     "email": "kristawest@carr.com"
    //   },
    //   {
    //     "id": "E086",
    //     "name": "Michele Sanchez",
    //     "role": "Kitchen Staff",
    //     "password": "password86",
    //     "dob": "1999-12-22",
    //     "telephone": "9260221025",
    //     "gender": "Male",
    //     "address": "275 Green Rue, South Lisa, MS 78268",
    //     "email": "icrawford@gmail.com"
    //   },
    //   {
    //     "id": "E087",
    //     "name": "Emily Parks",
    //     "role": "Kitchen Admin",
    //     "password": "password87",
    //     "dob": "1976-05-29",
    //     "telephone": "8483880419",
    //     "gender": "Female",
    //     "address": "0306 Sean Cove Suite 922, Stewartton, TX 90142",
    //     "email": "bmoore@yahoo.com"
    //   },
    //   {
    //     "id": "E088",
    //     "name": "Lisa Berry",
    //     "role": "Kitchen Admin",
    //     "password": "password88",
    //     "dob": "1971-04-23",
    //     "telephone": "9325597060",
    //     "gender": "Female",
    //     "address": "678 Suarez Plaza Apt. 948, Mitchelltown, PA 97999",
    //     "email": "cevans@yahoo.com"
    //   },
    //   {
    //     "id": "E089",
    //     "name": "Scott Ryan",
    //     "role": "Inventory Manager",
    //     "password": "password89",
    //     "dob": "1974-05-27",
    //     "telephone": "3510314647",
    //     "gender": "Male",
    //     "address": "81358 Crawford Corner Apt. 264, Sarahstad, UT 48813",
    //     "email": "karenscott@turner.info"
    //   },
    //   {
    //     "id": "E090",
    //     "name": "Michael Cruz",
    //     "role": "QA Engineer",
    //     "password": "password90",
    //     "dob": "1974-07-05",
    //     "telephone": "3356406261",
    //     "gender": "Male",
    //     "address": "8618 Jessica Valley, Melodyshire, MN 98105",
    //     "email": "zachary46@smith-james.com"
    //   },
    //   {
    //     "id": "E091",
    //     "name": "Michael Smith",
    //     "role": "Kitchen Staff",
    //     "password": "password91",
    //     "dob": "1979-11-24",
    //     "telephone": "7764585856",
    //     "gender": "Female",
    //     "address": "385 Henry Street, Lukeport, AZ 60282",
    //     "email": "paul31@carter.com"
    //   },
    //   {
    //     "id": "E092",
    //     "name": "Jennifer Wall",
    //     "role": "Kitchen Staff",
    //     "password": "password92",
    //     "dob": "1989-07-11",
    //     "telephone": "7591865665",
    //     "gender": "Male",
    //     "address": "908 Jill Vista Suite 768, West Brianhaven, MS 28775",
    //     "email": "shawnkeller@yahoo.com"
    //   },
    //   {
    //     "id": "E093",
    //     "name": "Michael Sandoval",
    //     "role": "Kitchen Admin",
    //     "password": "password93",
    //     "dob": "1965-07-30",
    //     "telephone": "3602468916",
    //     "gender": "Female",
    //     "address": "296 Martha Trail, North Christine, WY 32222",
    //     "email": "joseph23@kirby.com"
    //   },
    //   {
    //     "id": "E094",
    //     "name": "Rachel Stewart",
    //     "role": "Kitchen Staff",
    //     "password": "password94",
    //     "dob": "1972-07-12",
    //     "telephone": "5709203787",
    //     "gender": "Male",
    //     "address": "USNV Lawrence, FPO AE 62640",
    //     "email": "roydawn@kidd.com"
    //   },
    //   {
    //     "id": "E095",
    //     "name": "Ray Chavez",
    //     "role": "Kitchen Staff",
    //     "password": "password95",
    //     "dob": "1993-05-09",
    //     "telephone": "7288720369",
    //     "gender": "Female",
    //     "address": "Unit 6293 Box 7727, DPO AE 51684",
    //     "email": "courtney48@hotmail.com"
    //   },
    //   {
    //     "id": "E096",
    //     "name": "Jill Peterson",
    //     "role": "Software Architect",
    //     "password": "password96",
    //     "dob": "1989-12-04",
    //     "telephone": "6514050664",
    //     "gender": "Female",
    //     "address": "1921 Daniel Mills, Dawnton, FL 36037",
    //     "email": "uarnold@nunez.biz"
    //   },
    //   {
    //     "id": "E097",
    //     "name": "Brandon Mckenzie",
    //     "role": "Kitchen Staff",
    //     "password": "password97",
    //     "dob": "1984-12-19",
    //     "telephone": "5443290662",
    //     "gender": "Male",
    //     "address": "53229 Williams Track, Kimberlymouth, NJ 21528",
    //     "email": "natashahenry@yahoo.com"
    //   },
    //   {
    //     "id": "E098",
    //     "name": "Michael Robbins",
    //     "role": "Inventory Manager",
    //     "password": "password98",
    //     "dob": "1991-07-27",
    //     "telephone": "7813731729",
    //     "gender": "Female",
    //     "address": "489 Jennifer Tunnel, New Michael, NV 40793",
    //     "email": "uwalker@yahoo.com"
    //   },
    //   {
    //     "id": "E099",
    //     "name": "Peter Mcmahon DDS",
    //     "role": "Kitchen Staff",
    //     "password": "password99",
    //     "dob": "1996-02-28",
    //     "telephone": "0924827205",
    //     "gender": "Female",
    //     "address": "58277 Nathan Crossroad Suite 916, New Jennifer, MS 66497",
    //     "email": "villegasann@gmail.com"
    //   },
    //   {
    //     "id": "E100",
    //     "name": "Nathan Stout",
    //     "role": "Software Engineer",
    //     "password": "password100",
    //     "dob": "2003-09-13",
    //     "telephone": "2815312136",
    //     "gender": "Male",
    //     "address": "1172 Fry Mountain, East Brittany, TX 22428",
    //     "email": "cobbgregory@yahoo.com"
    //   }
    // ]


    const users: Prisma.UserCreateInput[]=[
      {
        "id": "E001",
        "name": "Joseph Kim",
        "role": "Kitchen Staff",
        "password": "password1",
        "dob": "1983-02-15",
        "telephone": "4911249283",
        "salary":65000,
        "gender": "Female",
        "address": "435 Elizabeth Stravenue, Williamsland, CA 32888",
        "email": "christianmark@sanders-lopez.com"
      },
      {
        "id": "E002",
        "name": "Maria Terry",
        "role": "Inventory Manager",
        "password": "password2",
        "dob": "2001-04-12",
        "telephone": "7463087835",
        "salary":150000,
        "gender": "Female",
        "address": "3259 Kim Keys, West Charlotteborough, LA 26562",
        "email": "sandra21@francis.biz"
      },
    ]

  try {
    for (const user of users) {
      await userService.create(user);
    }
    console.log('Users created successfully.');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await databaseService.$disconnect();
  }
}

main();
