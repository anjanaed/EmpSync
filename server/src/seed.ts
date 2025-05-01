import { Prisma } from '@prisma/client';
import { UserService } from './user/user.service';
import { DatabaseService } from './database/database.service';

const databaseService = new DatabaseService();
const userService = new UserService(databaseService);

async function main() {

    const users: Prisma.UserCreateInput[]=

    [
        {
            "id": "E001",
            "name": "Allison Hill",
            "role": "Inventory Manager",
            "password": "password1",
            "dob": "1979-07-09",
            "telephone": "1819600133",
            "gender": "Male",
            "address": "79402 Peterson Drives Apt. 511, Davisstad, KS 06196",
            "email": "allisonhill1@testmail.com",
            "salary": 122097
        },
        {
            "id": "E002",
            "name": "Kimberly Dudley",
            "role": "Kitchen Staff",
            "password": "password2",
            "dob": "1990-02-02",
            "telephone": "8495931034",
            "gender": "Male",
            "address": "525 Clark Grove Apt. 928, East Steven, SC 90699",
            "email": "kimberlydudley1@testmail.com",
            "salary": 86579
        },
        {
            "id": "E003",
            "name": "Melinda Cameron",
            "role": "Inventory Manager",
            "password": "password3",
            "dob": "1968-02-20",
            "telephone": "0564139537",
            "gender": "Male",
            "address": "884 Hurst Locks, Jeffreyberg, NM 12416",
            "email": "melindacameron1@testmail.com",
            "salary": 160604
        },
        {
            "id": "E004",
            "name": "Shannon Hernandez",
            "role": "Inventory Manager",
            "password": "password4",
            "dob": "1975-03-21",
            "telephone": "9166978480",
            "gender": "Male",
            "address": "46270 Stanton Track Apt. 814, East Nathaniel, ND 70015",
            "email": "shannonhernandez1@testmail.com",
            "salary": 74561
        },
        {
            "id": "E005",
            "name": "Linda Burns",
            "role": "Kitchen Staff",
            "password": "password5",
            "dob": "1971-12-11",
            "telephone": "4303911718",
            "gender": "Male",
            "address": "USNS Baker, FPO AP 55962",
            "email": "lindaburns1@testmail.com",
            "salary": 182475
        },
        {
            "id": "E006",
            "name": "Tanya Campos",
            "role": "software engineer",
            "password": "password6",
            "dob": "1978-01-07",
            "telephone": "6578713315",
            "gender": "Male",
            "address": "10310 Jones Freeway, Elizabethborough, DC 95312",
            "email": "tanyacampos1@testmail.com",
            "salary": 197127
        },
        {
            "id": "E007",
            "name": "Laura Kennedy",
            "role": "Kitchen Staff",
            "password": "password7",
            "dob": "1996-07-07",
            "telephone": "3116566701",
            "gender": "Female",
            "address": "33872 White Mountain, Port Sandra, OH 13334",
            "email": "laurakennedy1@testmail.com",
            "salary": 107787
        },
        {
            "id": "E008",
            "name": "Zachary Huff",
            "role": "HR_Manager",
            "password": "password8",
            "dob": "1970-09-05",
            "telephone": "2677360260",
            "gender": "Female",
            "address": "34309 Julie Centers Apt. 978, North Susan, HI 09482",
            "email": "zacharyhuff1@testmail.com",
            "salary": 51703
        },
        {
            "id": "E009",
            "name": "Megan Young",
            "role": "Kitchen Staff",
            "password": "password9",
            "dob": "1972-06-27",
            "telephone": "9909169985",
            "gender": "Female",
            "address": "47510 Howell Port Apt. 183, Davidstad, CA 32519",
            "email": "meganyoung1@testmail.com",
            "salary": 139194
        },
        {
            "id": "E010",
            "name": "Christopher Bass",
            "role": "Kitchen_Admin",
            "password": "password10",
            "dob": "1984-12-01",
            "telephone": "8412411824",
            "gender": "Male",
            "address": "487 Whitehead Vista, North Cynthiaview, AL 44220",
            "email": "christopherbass1@testmail.com",
            "salary": 106443
        },
        {
            "id": "E011",
            "name": "Mandy Green",
            "role": "Kitchen_Admin",
            "password": "password11",
            "dob": "1994-05-25",
            "telephone": "8011280598",
            "gender": "Male",
            "address": "53315 Dickson Summit Apt. 322, Johnsonmouth, MT 88307",
            "email": "mandygreen1@testmail.com",
            "salary": 74312
        },
        {
            "id": "E012",
            "name": "Rita Adams",
            "role": "HR_Manager",
            "password": "password12",
            "dob": "1971-09-08",
            "telephone": "0733754330",
            "gender": "Male",
            "address": "5868 Crosby Crescent, Gregoryview, CT 78694",
            "email": "ritaadams1@testmail.com",
            "salary": 144104
        },
        {
            "id": "E013",
            "name": "Nicholas Edwards",
            "role": "Kitchen_Admin",
            "password": "password13",
            "dob": "1999-02-18",
            "telephone": "6934060883",
            "gender": "Female",
            "address": "USNV Hanson, FPO AP 16835",
            "email": "nicholasedwards1@testmail.com",
            "salary": 61390
        },
        {
            "id": "E014",
            "name": "Elizabeth Parker",
            "role": "HR_Manager",
            "password": "password14",
            "dob": "1992-02-14",
            "telephone": "6482366299",
            "gender": "Male",
            "address": "3699 Marshall Mills Apt. 872, West Zacharymouth, WV 31285",
            "email": "elizabethparker1@testmail.com",
            "salary": 149230
        },
        {
            "id": "E015",
            "name": "Courtney Gonzalez",
            "role": "Inventory Manager",
            "password": "password15",
            "dob": "1965-12-29",
            "telephone": "3791769367",
            "gender": "Female",
            "address": "63287 Angela Vista, South Dennismouth, NC 73760",
            "email": "courtneygonzalez1@testmail.com",
            "salary": 144800
        },
        {
            "id": "E016",
            "name": "Tiffany Vance",
            "role": "software engineer",
            "password": "password16",
            "dob": "1998-09-06",
            "telephone": "8727743487",
            "gender": "Male",
            "address": "45581 Edward Lights Apt. 316, Riveramouth, AR 27611",
            "email": "tiffanyvance1@testmail.com",
            "salary": 68233
        },
        {
            "id": "E017",
            "name": "Jean Carrillo",
            "role": "Inventory Manager",
            "password": "password17",
            "dob": "1965-08-29",
            "telephone": "7054668893",
            "gender": "Male",
            "address": "5627 Tina Place, South Brittanytown, SD 56680",
            "email": "jeancarrillo1@testmail.com",
            "salary": 125861
        },
        {
            "id": "E018",
            "name": "Joel Williams",
            "role": "Inventory Manager",
            "password": "password18",
            "dob": "1990-02-16",
            "telephone": "3755646417",
            "gender": "Male",
            "address": "Unit 5310 Box 0330, DPO AP 20474",
            "email": "joelwilliams1@testmail.com",
            "salary": 76476
        },
        {
            "id": "E019",
            "name": "John Wilson",
            "role": "HR_Manager",
            "password": "password19",
            "dob": "1979-03-01",
            "telephone": "4529912419",
            "gender": "Female",
            "address": "3193 Heidi Hollow Apt. 905, Stanleyland, SD 45226",
            "email": "johnwilson1@testmail.com",
            "salary": 168858
        },
        {
            "id": "E020",
            "name": "Jason Henry",
            "role": "Kitchen_Admin",
            "password": "password20",
            "dob": "1993-10-31",
            "telephone": "7262849877",
            "gender": "Male",
            "address": "47379 Rogers Park, Hunterborough, KS 45109",
            "email": "jasonhenry1@testmail.com",
            "salary": 147040
        },
        {
            "id": "E021",
            "name": "Kyle Beard",
            "role": "Kitchen_Admin",
            "password": "password21",
            "dob": "2002-02-25",
            "telephone": "8313678377",
            "gender": "Male",
            "address": "349 Kennedy Pines Suite 685, Jacquelineview, KS 30718",
            "email": "kylebeard1@testmail.com",
            "salary": 119986
        },
        {
            "id": "E022",
            "name": "Corey Wilson",
            "role": "Inventory Manager",
            "password": "password22",
            "dob": "2000-10-17",
            "telephone": "3374989413",
            "gender": "Male",
            "address": "824 Terri Plaza, Heidiberg, WV 64841",
            "email": "coreywilson1@testmail.com",
            "salary": 190021
        },
        {
            "id": "E023",
            "name": "Adam Mitchell",
            "role": "Kitchen Staff",
            "password": "password23",
            "dob": "1996-11-27",
            "telephone": "5204711671",
            "gender": "Male",
            "address": "31869 Kimberly Light Suite 749, Torreston, WA 13507",
            "email": "adammitchell1@testmail.com",
            "salary": 171178
        },
        {
            "id": "E024",
            "name": "Christine Clark",
            "role": "HR_Manager",
            "password": "password24",
            "dob": "1969-11-08",
            "telephone": "3281206797",
            "gender": "Female",
            "address": "713 French Road Apt. 618, Lake Edward, FL 09860",
            "email": "christineclark1@testmail.com",
            "salary": 196001
        },
        {
            "id": "E025",
            "name": "Ricky Larson",
            "role": "Kitchen Staff",
            "password": "password25",
            "dob": "2003-01-24",
            "telephone": "7174648877",
            "gender": "Female",
            "address": "401 Suzanne Villages Apt. 490, South April, KY 24289",
            "email": "rickylarson1@testmail.com",
            "salary": 64663
        },
        {
            "id": "E026",
            "name": "Jessica Olsen DVM",
            "role": "Kitchen Staff",
            "password": "password26",
            "dob": "1996-04-25",
            "telephone": "6551256746",
            "gender": "Male",
            "address": "1680 Gutierrez Field Suite 977, East Josephberg, NV 92022",
            "email": "jessicaolsendvm1@testmail.com",
            "salary": 132694
        },
        {
            "id": "E027",
            "name": "Mr. Mark Lloyd",
            "role": "HR_Manager",
            "password": "password27",
            "dob": "1975-02-09",
            "telephone": "8086131712",
            "gender": "Female",
            "address": "7378 Patrick Rapid Apt. 146, Sarahhaven, AL 37573",
            "email": "mrmarklloyd1@testmail.com",
            "salary": 67350
        },
        {
            "id": "E028",
            "name": "Sara Carpenter",
            "role": "Kitchen Staff",
            "password": "password28",
            "dob": "1997-08-26",
            "telephone": "7875588675",
            "gender": "Female",
            "address": "57662 Hanna Crossroad Suite 171, Smithberg, SD 20733",
            "email": "saracarpenter1@testmail.com",
            "salary": 105738
        },
        {
            "id": "E029",
            "name": "Richard Baker",
            "role": "HR_Manager",
            "password": "password29",
            "dob": "1991-05-19",
            "telephone": "5865780913",
            "gender": "Female",
            "address": "172 Berger Cape, Lauraport, MN 56951",
            "email": "richardbaker1@testmail.com",
            "salary": 170285
        },
        {
            "id": "E030",
            "name": "Joseph Knight",
            "role": "Kitchen Staff",
            "password": "password30",
            "dob": "1976-08-01",
            "telephone": "2196937923",
            "gender": "Female",
            "address": "4821 Landry Radial, Daniellechester, KS 60379",
            "email": "josephknight1@testmail.com",
            "salary": 86603
        },
        {
            "id": "E031",
            "name": "Christina Cruz",
            "role": "Kitchen Staff",
            "password": "password31",
            "dob": "1997-03-19",
            "telephone": "3695944064",
            "gender": "Female",
            "address": "PSC 7439, Box 5339, APO AA 89336",
            "email": "christinacruz1@testmail.com",
            "salary": 162311
        },
        {
            "id": "E032",
            "name": "Patricia Becker",
            "role": "software engineer",
            "password": "password32",
            "dob": "1973-08-21",
            "telephone": "0470952145",
            "gender": "Female",
            "address": "842 Sloan Orchard Suite 517, East Karenbury, TX 95425",
            "email": "patriciabecker1@testmail.com",
            "salary": 144895
        },
        {
            "id": "E033",
            "name": "Jennifer Singleton",
            "role": "Kitchen Staff",
            "password": "password33",
            "dob": "2002-04-04",
            "telephone": "1604817549",
            "gender": "Male",
            "address": "98593 Cynthia Mountain Suite 612, North Kevinfort, CT 31276",
            "email": "jennifersingleton1@testmail.com",
            "salary": 183569
        },
        {
            "id": "E034",
            "name": "Brandy Chavez",
            "role": "HR_Manager",
            "password": "password34",
            "dob": "2001-02-02",
            "telephone": "9261796405",
            "gender": "Male",
            "address": "USNV Garcia, FPO AP 48648",
            "email": "brandychavez1@testmail.com",
            "salary": 62351
        },
        {
            "id": "E035",
            "name": "Vanessa Howard",
            "role": "Inventory Manager",
            "password": "password35",
            "dob": "1991-06-04",
            "telephone": "3171390053",
            "gender": "Male",
            "address": "335 Kristina Ranch, West Micheleberg, ND 33354",
            "email": "vanessahoward1@testmail.com",
            "salary": 91938
        },
        {
            "id": "E036",
            "name": "Ashley Delacruz",
            "role": "HR_Manager",
            "password": "password36",
            "dob": "1973-04-19",
            "telephone": "5395024026",
            "gender": "Male",
            "address": "917 Sonia Cape Suite 700, Boonechester, CT 64761",
            "email": "ashleydelacruz1@testmail.com",
            "salary": 150864
        },
        {
            "id": "E037",
            "name": "Jill Lam",
            "role": "HR_Manager",
            "password": "password37",
            "dob": "1986-04-02",
            "telephone": "1249985698",
            "gender": "Female",
            "address": "183 Hayes Forks, Morganmouth, MT 96132",
            "email": "jilllam1@testmail.com",
            "salary": 188704
        },
        {
            "id": "E038",
            "name": "Jeffery Ortega",
            "role": "Kitchen_Admin",
            "password": "password38",
            "dob": "1989-10-20",
            "telephone": "7111161528",
            "gender": "Male",
            "address": "5604 Bell Ports, East Diane, CT 46391",
            "email": "jefferyortega1@testmail.com",
            "salary": 80029
        },
        {
            "id": "E039",
            "name": "Holly Farmer",
            "role": "software engineer",
            "password": "password39",
            "dob": "2003-05-26",
            "telephone": "6899809402",
            "gender": "Female",
            "address": "96120 Julie Forge, Barnesmouth, MN 41347",
            "email": "hollyfarmer1@testmail.com",
            "salary": 139174
        },
        {
            "id": "E040",
            "name": "Paula Bradley",
            "role": "Inventory Manager",
            "password": "password40",
            "dob": "1970-02-10",
            "telephone": "2290147679",
            "gender": "Female",
            "address": "6149 Rose Inlet, East Randallton, IL 40008",
            "email": "paulabradley1@testmail.com",
            "salary": 163971
        },
        {
            "id": "E041",
            "name": "Pamela Duran",
            "role": "Kitchen Staff",
            "password": "password41",
            "dob": "1984-01-11",
            "telephone": "1076226838",
            "gender": "Female",
            "address": "0715 Berry Station, Robertsfurt, MD 23028",
            "email": "pameladuran1@testmail.com",
            "salary": 50850
        },
        {
            "id": "E042",
            "name": "Lisa Collier",
            "role": "Kitchen_Admin",
            "password": "password42",
            "dob": "1988-12-14",
            "telephone": "6136968164",
            "gender": "Male",
            "address": "188 Rebecca Keys, Jessicaberg, CT 19695",
            "email": "lisacollier1@testmail.com",
            "salary": 183085
        },
        {
            "id": "E043",
            "name": "Christopher Hernandez",
            "role": "Inventory Manager",
            "password": "password43",
            "dob": "1969-06-16",
            "telephone": "7799799552",
            "gender": "Female",
            "address": "9058 Lance Mission Apt. 054, Lake Michelleland, PA 66963",
            "email": "christopherhernandez1@testmail.com",
            "salary": 183080
        },
        {
            "id": "E044",
            "name": "Kevin Best",
            "role": "software engineer",
            "password": "password44",
            "dob": "1967-02-14",
            "telephone": "9359782071",
            "gender": "Male",
            "address": "77889 Michael Haven, Ortizmouth, PA 07364",
            "email": "kevinbest1@testmail.com",
            "salary": 90065
        },
        {
            "id": "E045",
            "name": "Maria Jones",
            "role": "Kitchen_Admin",
            "password": "password45",
            "dob": "1970-10-05",
            "telephone": "4492519254",
            "gender": "Male",
            "address": "8652 Debbie Manors, Andrewport, IL 45292",
            "email": "mariajones1@testmail.com",
            "salary": 191394
        },
        {
            "id": "E046",
            "name": "Katelyn Perez",
            "role": "software engineer",
            "password": "password46",
            "dob": "1973-09-10",
            "telephone": "1418880592",
            "gender": "Male",
            "address": "706 Rhodes Freeway, Bishopmouth, ND 31849",
            "email": "katelynperez1@testmail.com",
            "salary": 134975
        },
        {
            "id": "E047",
            "name": "Robert Harrison",
            "role": "HR_Manager",
            "password": "password47",
            "dob": "1977-07-14",
            "telephone": "9774688623",
            "gender": "Male",
            "address": "8181 Miller Estates Suite 782, Davisbury, NV 46321",
            "email": "robertharrison1@testmail.com",
            "salary": 79325
        },
        {
            "id": "E048",
            "name": "Jennifer Sanders",
            "role": "Kitchen_Admin",
            "password": "password48",
            "dob": "1989-10-11",
            "telephone": "6153051522",
            "gender": "Female",
            "address": "779 Rebecca Brook, Jasonberg, VA 80308",
            "email": "jennifersanders1@testmail.com",
            "salary": 112770
        },
        {
            "id": "E049",
            "name": "Ashley Roberts",
            "role": "Inventory Manager",
            "password": "password49",
            "dob": "1984-10-28",
            "telephone": "0369711798",
            "gender": "Male",
            "address": "6095 Ashley Ferry, New Theresaland, ND 66997",
            "email": "ashleyroberts1@testmail.com",
            "salary": 198729
        },
        {
            "id": "E050",
            "name": "Katie Smith",
            "role": "Inventory Manager",
            "password": "password50",
            "dob": "1996-04-28",
            "telephone": "6540515319",
            "gender": "Male",
            "address": "277 Lisa Circles Suite 043, Port Jameston, ME 68053",
            "email": "katiesmith1@testmail.com",
            "salary": 177399
        }
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
