import { Prisma } from '@prisma/client';
import { UserService } from './user/user.service';
import { DatabaseService } from './database/database.service';

const databaseService = new DatabaseService();
const userService = new UserService(databaseService);

async function main() {

    // const users: Prisma.UserCreateInput[]=

    // [
    //     {
    //         "id": "E001",
    //         "name": "Stacie Coleman",
    //         "role": "Cleaner",
    //         "password": "password1",
    //         "dob": "1984-11-29",
    //         "telephone": "9338988156",
    //         "gender": "Male",
    //         "address": "Unit 7542 Box 6570, DPO AA 77108",
    //         "email": "staciecoleman1@testmail.com",
    //         "salary": 188447
    //     },
    //     {
    //         "id": "E002",
    //         "name": "Jessica Simmons",
    //         "role": "Kitchen Staff",
    //         "password": "password2",
    //         "dob": "1993-05-14",
    //         "telephone": "3165539251",
    //         "gender": "Male",
    //         "address": "486 Dustin Lock Suite 319, Toddhaven, WY 04077",
    //         "email": "jessicasimmons2@testmail.com",
    //         "salary": 178138
    //     },
    //     {
    //         "id": "E003",
    //         "name": "Catherine Harris",
    //         "role": "Security",
    //         "password": "password3",
    //         "dob": "1992-04-06",
    //         "telephone": "9686663419",
    //         "gender": "Female",
    //         "address": "5541 Stevens Port, Rodriguezmouth, IN 80414",
    //         "email": "catherineharris3@testmail.com",
    //         "salary": 172479
    //     },
    //     {
    //         "id": "E004",
    //         "name": "Joshua Humphrey",
    //         "role": "Security",
    //         "password": "password4",
    //         "dob": "1984-07-18",
    //         "telephone": "7257143791",
    //         "gender": "Male",
    //         "address": "33955 Walker Islands, East Brianport, WY 18168",
    //         "email": "joshuahumphrey4@testmail.com",
    //         "salary": 134687
    //     },
    //     {
    //         "id": "E005",
    //         "name": "Terry Butler",
    //         "role": "Kitchen Staff",
    //         "password": "password5",
    //         "dob": "1971-10-10",
    //         "telephone": "6800408258",
    //         "gender": "Female",
    //         "address": "36407 Vasquez Stravenue Apt. 585, New Hollyton, ME 78351",
    //         "email": "terrybutler5@testmail.com",
    //         "salary": 191824
    //     },
    //     {
    //         "id": "E006",
    //         "name": "Candice Nichols",
    //         "role": "Manager",
    //         "password": "password6",
    //         "dob": "1996-05-02",
    //         "telephone": "2372256579",
    //         "gender": "Male",
    //         "address": "73422 Russell Coves Apt. 904, Port Michellefurt, OR 22628",
    //         "email": "candicenichols6@testmail.com",
    //         "salary": 126328
    //     },
    //     {
    //         "id": "E007",
    //         "name": "Brian Wallace",
    //         "role": "Security",
    //         "password": "password7",
    //         "dob": "2000-10-14",
    //         "telephone": "4953458001",
    //         "gender": "Female",
    //         "address": "49987 Stewart Parkways, Lake Vanessa, CA 21839",
    //         "email": "brianwallace7@testmail.com",
    //         "salary": 176557
    //     },
    //     {
    //         "id": "E008",
    //         "name": "Jackson Rowe MD",
    //         "role": "Maintenance",
    //         "password": "password8",
    //         "dob": "1981-08-06",
    //         "telephone": "8426372942",
    //         "gender": "Female",
    //         "address": "034 Carter Knolls Apt. 791, Nicholaston, ND 24675",
    //         "email": "jacksonrowemd8@testmail.com",
    //         "salary": 176522
    //     },
    //     {
    //         "id": "E009",
    //         "name": "Carl Williams",
    //         "role": "Security",
    //         "password": "password9",
    //         "dob": "1988-08-04",
    //         "telephone": "4285214940",
    //         "gender": "Female",
    //         "address": "USNV Martinez, FPO AA 93395",
    //         "email": "carlwilliams9@testmail.com",
    //         "salary": 148364
    //     },
    //     {
    //         "id": "E010",
    //         "name": "Sharon Johnson",
    //         "role": "Cleaner",
    //         "password": "password10",
    //         "dob": "1971-01-21",
    //         "telephone": "9840907478",
    //         "gender": "Male",
    //         "address": "872 Ayala Stream Suite 701, Sawyertown, NC 10313",
    //         "email": "sharonjohnson10@testmail.com",
    //         "salary": 195293
    //     },
    //     {
    //         "id": "E011",
    //         "name": "Robert Green",
    //         "role": "Manager",
    //         "password": "password11",
    //         "dob": "1973-07-22",
    //         "telephone": "7505541875",
    //         "gender": "Male",
    //         "address": "5535 Terrell Mount Suite 103, Port Geoffreyberg, IL 70938",
    //         "email": "robertgreen11@testmail.com",
    //         "salary": 121875
    //     },
    //     {
    //         "id": "E012",
    //         "name": "Jamie Joseph",
    //         "role": "Cleaner",
    //         "password": "password12",
    //         "dob": "1976-06-19",
    //         "telephone": "5291779220",
    //         "gender": "Female",
    //         "address": "37741 Schwartz Stream, South Lucasshire, VA 66949",
    //         "email": "jamiejoseph12@testmail.com",
    //         "salary": 198906
    //     },
    //     {
    //         "id": "E013",
    //         "name": "Jennifer Martinez",
    //         "role": "Kitchen Staff",
    //         "password": "password13",
    //         "dob": "2002-12-17",
    //         "telephone": "7217759907",
    //         "gender": "Female",
    //         "address": "09340 Chapman Coves, Nathanshire, MN 24036",
    //         "email": "jennifermartinez13@testmail.com",
    //         "salary": 151432
    //     },
    //     {
    //         "id": "E014",
    //         "name": "Pamela Stevens",
    //         "role": "Cleaner",
    //         "password": "password14",
    //         "dob": "1987-12-25",
    //         "telephone": "8023661621",
    //         "gender": "Male",
    //         "address": "67233 Leslie Crest Apt. 331, Sheltonview, ID 17555",
    //         "email": "pamelastevens14@testmail.com",
    //         "salary": 150804
    //     },
    //     {
    //         "id": "E015",
    //         "name": "Maurice Spence",
    //         "role": "Maintenance",
    //         "password": "password15",
    //         "dob": "1964-11-08",
    //         "telephone": "8938034829",
    //         "gender": "Female",
    //         "address": "11552 Donald Grove Apt. 555, New Dennis, WV 82974",
    //         "email": "mauricespence15@testmail.com",
    //         "salary": 161090
    //     },
    //     {
    //         "id": "E016",
    //         "name": "Deborah Russell",
    //         "role": "Manager",
    //         "password": "password16",
    //         "dob": "1993-12-11",
    //         "telephone": "6639811268",
    //         "gender": "Male",
    //         "address": "6196 Erica Dam, Hayesburgh, FL 71532",
    //         "email": "deborahrussell16@testmail.com",
    //         "salary": 152341
    //     },
    //     {
    //         "id": "E017",
    //         "name": "Gabrielle Gonzalez",
    //         "role": "Kitchen Staff",
    //         "password": "password17",
    //         "dob": "1982-06-24",
    //         "telephone": "3393183700",
    //         "gender": "Female",
    //         "address": "264 Kaitlyn River, South Scottville, MD 99655",
    //         "email": "gabriellegonzalez17@testmail.com",
    //         "salary": 169982
    //     },
    //     {
    //         "id": "E018",
    //         "name": "Andrew Jackson",
    //         "role": "Cleaner",
    //         "password": "password18",
    //         "dob": "1999-05-03",
    //         "telephone": "2301255783",
    //         "gender": "Female",
    //         "address": "42122 Aaron Viaduct, North Jacobtown, NM 64511",
    //         "email": "andrewjackson18@testmail.com",
    //         "salary": 129705
    //     },
    //     {
    //         "id": "E019",
    //         "name": "Dylan Thomas",
    //         "role": "Manager",
    //         "password": "password19",
    //         "dob": "1994-05-22",
    //         "telephone": "8996068559",
    //         "gender": "Female",
    //         "address": "961 Forbes River, West Stephanie, TX 14737",
    //         "email": "dylanthomas19@testmail.com",
    //         "salary": 160087
    //     },
    //     {
    //         "id": "E020",
    //         "name": "Zachary Torres",
    //         "role": "Security",
    //         "password": "password20",
    //         "dob": "1974-10-18",
    //         "telephone": "8814804071",
    //         "gender": "Female",
    //         "address": "916 Hannah Lake Apt. 567, Lake Michaelstad, TX 40943",
    //         "email": "zacharytorres20@testmail.com",
    //         "salary": 173895
    //     },
    //     {
    //         "id": "E021",
    //         "name": "Miss Michele Robertson",
    //         "role": "Receptionist",
    //         "password": "password21",
    //         "dob": "1984-05-23",
    //         "telephone": "5570442965",
    //         "gender": "Male",
    //         "address": "767 Ashley Road Suite 262, Lake Wesleyhaven, RI 50010",
    //         "email": "missmichelerobertson21@testmail.com",
    //         "salary": 158580
    //     },
    //     {
    //         "id": "E022",
    //         "name": "Amanda Jefferson",
    //         "role": "Manager",
    //         "password": "password22",
    //         "dob": "2004-12-24",
    //         "telephone": "9275714404",
    //         "gender": "Female",
    //         "address": "PSC 0832, Box 0837, APO AE 90339",
    //         "email": "amandajefferson22@testmail.com",
    //         "salary": 155670
    //     },
    //     {
    //         "id": "E023",
    //         "name": "William Lewis",
    //         "role": "Receptionist",
    //         "password": "password23",
    //         "dob": "1977-02-13",
    //         "telephone": "1086586169",
    //         "gender": "Female",
    //         "address": "Unit 2457 Box 3862, DPO AA 25391",
    //         "email": "williamlewis23@testmail.com",
    //         "salary": 134441
    //     },
    //     {
    //         "id": "E024",
    //         "name": "Glenn Lawrence",
    //         "role": "Cleaner",
    //         "password": "password24",
    //         "dob": "1982-03-16",
    //         "telephone": "7759986539",
    //         "gender": "Male",
    //         "address": "85251 Arias Valleys, Shellyfort, AK 29493",
    //         "email": "glennlawrence24@testmail.com",
    //         "salary": 181835
    //     },
    //     {
    //         "id": "E025",
    //         "name": "Phyllis Salazar",
    //         "role": "Kitchen Staff",
    //         "password": "password25",
    //         "dob": "1964-05-23",
    //         "telephone": "3568508294",
    //         "gender": "Female",
    //         "address": "880 King Spring, Allisonstad, DC 63760",
    //         "email": "phyllissalazar25@testmail.com",
    //         "salary": 123926
    //     },
    //     {
    //         "id": "E026",
    //         "name": "Dr. Diane Gutierrez",
    //         "role": "Maintenance",
    //         "password": "password26",
    //         "dob": "1995-04-11",
    //         "telephone": "1418511777",
    //         "gender": "Male",
    //         "address": "457 Donald Lock, West Steven, WI 23892",
    //         "email": "dr.dianegutierrez26@testmail.com",
    //         "salary": 127379
    //     },
    //     {
    //         "id": "E027",
    //         "name": "Dustin Luna",
    //         "role": "Maintenance",
    //         "password": "password27",
    //         "dob": "1991-02-24",
    //         "telephone": "0776635362",
    //         "gender": "Male",
    //         "address": "49486 Tate Extensions Apt. 004, New Joanna, NM 01771",
    //         "email": "dustinluna27@testmail.com",
    //         "salary": 129563
    //     },
    //     {
    //         "id": "E028",
    //         "name": "Dr. Carmen Elliott MD",
    //         "role": "Security",
    //         "password": "password28",
    //         "dob": "1964-09-04",
    //         "telephone": "7260117204",
    //         "gender": "Female",
    //         "address": "48551 Anthony Harbors Suite 818, East Jasmine, NY 72505",
    //         "email": "dr.carmenelliottmd28@testmail.com",
    //         "salary": 182539
    //     },
    //     {
    //         "id": "E029",
    //         "name": "Sandra Rubio",
    //         "role": "Security",
    //         "password": "password29",
    //         "dob": "1989-07-26",
    //         "telephone": "4442018171",
    //         "gender": "Male",
    //         "address": "369 Smith Oval, West Alishatown, MA 34731",
    //         "email": "sandrarubio29@testmail.com",
    //         "salary": 183471
    //     },
    //     {
    //         "id": "E030",
    //         "name": "Samantha Johnson",
    //         "role": "Maintenance",
    //         "password": "password30",
    //         "dob": "1979-12-26",
    //         "telephone": "1700637677",
    //         "gender": "Female",
    //         "address": "6340 Villegas Pike Suite 009, Lake David, MD 30671",
    //         "email": "samanthajohnson30@testmail.com",
    //         "salary": 135271
    //     },
    //     {
    //         "id": "E031",
    //         "name": "Catherine Anthony",
    //         "role": "Kitchen Staff",
    //         "password": "password31",
    //         "dob": "1970-09-21",
    //         "telephone": "1658844759",
    //         "gender": "Male",
    //         "address": "5541 Cooper Glen Apt. 106, Port Richard, KY 61152",
    //         "email": "catherineanthony31@testmail.com",
    //         "salary": 191543
    //     },
    //     {
    //         "id": "E032",
    //         "name": "Mercedes Williams",
    //         "role": "Cleaner",
    //         "password": "password32",
    //         "dob": "1985-05-02",
    //         "telephone": "9372370294",
    //         "gender": "Male",
    //         "address": "28339 Alexandria Port Suite 027, Garciaborough, SC 21529",
    //         "email": "mercedeswilliams32@testmail.com",
    //         "salary": 177977
    //     },
    //     {
    //         "id": "E033",
    //         "name": "Jasmin Lester",
    //         "role": "Cleaner",
    //         "password": "password33",
    //         "dob": "1980-05-01",
    //         "telephone": "9760680022",
    //         "gender": "Female",
    //         "address": "1456 Tucker Mission, East Lauratown, NV 40159",
    //         "email": "jasminlester33@testmail.com",
    //         "salary": 193304
    //     },
    //     {
    //         "id": "E034",
    //         "name": "Thomas Johnson",
    //         "role": "Kitchen Staff",
    //         "password": "password34",
    //         "dob": "1988-12-08",
    //         "telephone": "6402448539",
    //         "gender": "Female",
    //         "address": "6917 Evans Manor Apt. 590, Hicksmouth, CA 57275",
    //         "email": "thomasjohnson34@testmail.com",
    //         "salary": 135810
    //     },
    //     {
    //         "id": "E035",
    //         "name": "Jennifer Guerra",
    //         "role": "Receptionist",
    //         "password": "password35",
    //         "dob": "1977-05-28",
    //         "telephone": "6829835269",
    //         "gender": "Female",
    //         "address": "PSC 8701, Box 3052, APO AP 19821",
    //         "email": "jenniferguerra35@testmail.com",
    //         "salary": 147215
    //     },
    //     {
    //         "id": "E036",
    //         "name": "Anthony Hooper",
    //         "role": "Manager",
    //         "password": "password36",
    //         "dob": "1966-05-15",
    //         "telephone": "0191448819",
    //         "gender": "Female",
    //         "address": "0241 Wright Underpass, Haileyberg, HI 98275",
    //         "email": "anthonyhooper36@testmail.com",
    //         "salary": 179472
    //     },
    //     {
    //         "id": "E037",
    //         "name": "Terry Mendoza",
    //         "role": "Manager",
    //         "password": "password37",
    //         "dob": "1984-12-02",
    //         "telephone": "9393230681",
    //         "gender": "Male",
    //         "address": "2279 Barber Locks Suite 775, East Charles, MA 86178",
    //         "email": "terrymendoza37@testmail.com",
    //         "salary": 181841
    //     },
    //     {
    //         "id": "E038",
    //         "name": "Casey Owen",
    //         "role": "Receptionist",
    //         "password": "password38",
    //         "dob": "1994-08-17",
    //         "telephone": "6723021637",
    //         "gender": "Female",
    //         "address": "39386 Hayes Streets Apt. 718, Kaylaberg, IL 15930",
    //         "email": "caseyowen38@testmail.com",
    //         "salary": 162285
    //     },
    //     {
    //         "id": "E039",
    //         "name": "Robert Smith",
    //         "role": "Manager",
    //         "password": "password39",
    //         "dob": "1999-01-19",
    //         "telephone": "8090264788",
    //         "gender": "Female",
    //         "address": "4765 Flores Squares Suite 580, Maciasmouth, VA 42659",
    //         "email": "robertsmith39@testmail.com",
    //         "salary": 190677
    //     },
    //     {
    //         "id": "E040",
    //         "name": "Rodney Le",
    //         "role": "Kitchen Staff",
    //         "password": "password40",
    //         "dob": "1973-10-12",
    //         "telephone": "8962523841",
    //         "gender": "Female",
    //         "address": "74814 Stanton Stravenue Apt. 832, South Christopher, WV 05292",
    //         "email": "rodneyle40@testmail.com",
    //         "salary": 199370
    //     },
    //     {
    //         "id": "E041",
    //         "name": "Brian Robinson",
    //         "role": "Receptionist",
    //         "password": "password41",
    //         "dob": "2000-09-12",
    //         "telephone": "5780746479",
    //         "gender": "Female",
    //         "address": "478 Yolanda Forges, North Jason, CT 92702",
    //         "email": "brianrobinson41@testmail.com",
    //         "salary": 198059
    //     },
    //     {
    //         "id": "E042",
    //         "name": "William Oliver",
    //         "role": "Security",
    //         "password": "password42",
    //         "dob": "1982-11-04",
    //         "telephone": "8018197862",
    //         "gender": "Male",
    //         "address": "27276 Justin Glen Suite 039, Hillville, IL 70228",
    //         "email": "williamoliver42@testmail.com",
    //         "salary": 178943
    //     },
    //     {
    //         "id": "E043",
    //         "name": "Dr. Christian Juarez",
    //         "role": "Maintenance",
    //         "password": "password43",
    //         "dob": "2003-11-10",
    //         "telephone": "1137356727",
    //         "gender": "Male",
    //         "address": "43954 Douglas Village, New Steventown, IA 16896",
    //         "email": "dr.christianjuarez43@testmail.com",
    //         "salary": 159149
    //     },
    //     {
    //         "id": "E044",
    //         "name": "Alan Figueroa",
    //         "role": "Security",
    //         "password": "password44",
    //         "dob": "1983-07-09",
    //         "telephone": "8305647650",
    //         "gender": "Male",
    //         "address": "1740 Logan Crossing, Jessicaville, NE 09856",
    //         "email": "alanfigueroa44@testmail.com",
    //         "salary": 158650
    //     },
    //     {
    //         "id": "E045",
    //         "name": "Adrienne Garcia",
    //         "role": "Manager",
    //         "password": "password45",
    //         "dob": "2005-04-10",
    //         "telephone": "9060764543",
    //         "gender": "Female",
    //         "address": "415 Renee Motorway Suite 713, Brownland, IA 31938",
    //         "email": "adriennegarcia45@testmail.com",
    //         "salary": 190151
    //     },
    //     {
    //         "id": "E046",
    //         "name": "Victoria Jones",
    //         "role": "Kitchen Staff",
    //         "password": "password46",
    //         "dob": "1978-11-07",
    //         "telephone": "6763991780",
    //         "gender": "Female",
    //         "address": "835 Hebert Squares Apt. 399, Kaitlynmouth, AR 02182",
    //         "email": "victoriajones46@testmail.com",
    //         "salary": 125086
    //     },
    //     {
    //         "id": "E047",
    //         "name": "Jerome Coffey",
    //         "role": "Security",
    //         "password": "password47",
    //         "dob": "1978-10-22",
    //         "telephone": "8494881954",
    //         "gender": "Female",
    //         "address": "6661 Mendez Course Suite 411, Jimburgh, SD 12761",
    //         "email": "jeromecoffey47@testmail.com",
    //         "salary": 186499
    //     },
    //     {
    //         "id": "E048",
    //         "name": "Robert Randall",
    //         "role": "Maintenance",
    //         "password": "password48",
    //         "dob": "1998-03-31",
    //         "telephone": "7630824441",
    //         "gender": "Female",
    //         "address": "394 Pamela Rest Apt. 350, North Jenniferchester, SC 55124",
    //         "email": "robertrandall48@testmail.com",
    //         "salary": 196448
    //     },
    //     {
    //         "id": "E049",
    //         "name": "Seth Jordan",
    //         "role": "Maintenance",
    //         "password": "password49",
    //         "dob": "1984-05-06",
    //         "telephone": "4653078031",
    //         "gender": "Female",
    //         "address": "3810 Brett Landing Apt. 714, Hamptonfort, MN 55985",
    //         "email": "sethjordan49@testmail.com",
    //         "salary": 141688
    //     },
    //     {
    //         "id": "E050",
    //         "name": "Michael Logan",
    //         "role": "Manager",
    //         "password": "password50",
    //         "dob": "1968-12-30",
    //         "telephone": "0428849440",
    //         "gender": "Male",
    //         "address": "349 Rojas Pines Suite 476, New Sharon, NE 68212",
    //         "email": "michaellogan50@testmail.com",
    //         "salary": 190767
    //     }
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
