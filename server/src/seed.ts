import { Prisma } from '@prisma/client';
import { UserService } from './core/user/user.service';
import { DatabaseService } from './database/database.service';
import { MealService } from './modules/meal/meal.service';
import { IngredientsService } from './modules/ingredient/ingredient.service';

const databaseService = new DatabaseService();
const userService = new UserService(databaseService);
const mealService = new MealService(databaseService);
const ingredientsService = new IngredientsService(databaseService);

async function main() {

    const users: Prisma.UserCreateInput[]=

    [
        {
            "id": "E001",
            "name": "Rachel Allen",
            "role": "KITCHEN_ADMIN",
            "password": "vj621MnzK!",
            "dob": "1988-04-21",
            "telephone": "+1-721-184-7072",
            "gender": "Female",
            "address": "87702 Phelps Springs, Bradleystad, DE 52474",
            "email": "fbeck@yahoo.com",
            "salary": 93698
        },
        {
            "id": "E002",
            "name": "Mary Bryant",
            "role": "HR_ADMIN",
            "password": "!0yOIF9k&y",
            "dob": "1977-11-01",
            "telephone": "(959)285-1510x92165",
            "gender": "Female",
            "address": "4803 Mathews Centers Apt. 685, South Saramouth, MS 16262",
            "email": "ithomas@yahoo.com",
            "salary": 141178
        },
        {
            "id": "E003",
            "name": "Gary Crawford",
            "role": "HR_ADMIN",
            "password": "$^LpHfnwS5",
            "dob": "1992-07-09",
            "telephone": "008-629-9228x34279",
            "gender": "Male",
            "address": "185 Crystal Path, Fisherbury, WA 67329",
            "email": "thomaselizabeth@yahoo.com",
            "salary": 145154
        },
        {
            "id": "E004",
            "name": "Gregory Ramos",
            "role": "KITCHEN_ADMIN",
            "password": "1NWh1aBi&m",
            "dob": "1975-08-28",
            "telephone": "662-413-3889",
            "gender": "Female",
            "address": "79013 Brian Drive, Port Danielland, IL 51257",
            "email": "charlenewilliams@hotmail.com",
            "salary": 125511
        },
        {
            "id": "E005",
            "name": "Kimberly Lee",
            "role": "software engineer",
            "password": "SV1(Ko$kW(",
            "dob": "1967-10-02",
            "telephone": "054-708-5742",
            "gender": "Male",
            "address": "6745 Soto Crossroad, Port Annamouth, PA 78650",
            "email": "gwalker@rhodes.org",
            "salary": 130328
        },
        {
            "id": "E006",
            "name": "Michael King",
            "role": "KITCHEN_ADMIN",
            "password": "(!xt7DOi*v",
            "dob": "1987-11-24",
            "telephone": "4447526440",
            "gender": "Male",
            "address": "16443 Brandy Row, Snyderberg, CA 03876",
            "email": "aaron87@gmail.com",
            "salary": 100134
        },
        {
            "id": "E007",
            "name": "Steven Lopez",
            "role": "INVENTORY_ADMIN",
            "password": "gv6WKwl2%i",
            "dob": "1980-10-02",
            "telephone": "935-631-6711x3814",
            "gender": "Male",
            "address": "104 Michael Pines, Edwardfurt, OR 27196",
            "email": "yrodriguez@gmail.com",
            "salary": 104076
        },
        {
            "id": "E008",
            "name": "John Perez",
            "role": "KITCHEN_STAFF",
            "password": "x02&FDld+G",
            "dob": "1985-11-23",
            "telephone": "001-183-813-3377",
            "gender": "Female",
            "address": "PSC 2322, Box 5903, APO AA 28344",
            "email": "debra01@gmail.com",
            "salary": 142080
        },
        {
            "id": "E009",
            "name": "Allison Brown",
            "role": "KITCHEN_ADMIN",
            "password": ")7HqDXBYiS",
            "dob": "1990-08-08",
            "telephone": "202.510.4045",
            "gender": "Male",
            "address": "23440 Cook Hills Suite 005, New Timothy, NJ 40472",
            "email": "natasha54@hotmail.com",
            "salary": 50096
        },
        {
            "id": "E010",
            "name": "Sarah Hopkins",
            "role": "INVENTORY_ADMIN",
            "password": "589w9Vq9$m",
            "dob": "1972-06-27",
            "telephone": "001-735-445-3921x21043",
            "gender": "Male",
            "address": "7921 Powell River Suite 537, Port Pamelabury, MS 73093",
            "email": "robert70@hickman-parker.net",
            "salary": 62833
        },
        {
            "id": "E011",
            "name": "Katie Hunt",
            "role": "KITCHEN_ADMIN",
            "password": "32KsouHi*1",
            "dob": "1978-02-28",
            "telephone": "001-510-819-0463",
            "gender": "Female",
            "address": "1252 Karen Field, New Jenniferland, VA 83023",
            "email": "rebeccastewart@cohen.com",
            "salary": 139518
        },
        {
            "id": "E012",
            "name": "Michelle Freeman",
            "role": "INVENTORY_ADMIN",
            "password": "^)6aHNqGh*",
            "dob": "1969-03-30",
            "telephone": "(482)239-4433x467",
            "gender": "Male",
            "address": "72417 Ramirez Key Apt. 832, Brettshire, IA 77418",
            "email": "fgalvan@yahoo.com",
            "salary": 145894
        },
        {
            "id": "E013",
            "name": "Kim Cunningham",
            "role": "INVENTORY_ADMIN",
            "password": "M6Puv1Ec)Y",
            "dob": "1975-03-17",
            "telephone": "(543)892-7876x749",
            "gender": "Female",
            "address": "1464 Crawford Parkways Suite 946, Brownton, IN 49891",
            "email": "karenjohnson@potter.biz",
            "salary": 100810
        },
        {
            "id": "E014",
            "name": "Kevin Scott",
            "role": "HR_ADMIN",
            "password": "_9Y)9ws93k",
            "dob": "1992-11-14",
            "telephone": "001-458-237-7600x541",
            "gender": "Male",
            "address": "600 Joseph Groves, Troyburgh, DE 14317",
            "email": "spencersamantha@nichols-aguilar.com",
            "salary": 74069
        },
        {
            "id": "E015",
            "name": "Ricky Valenzuela",
            "role": "KITCHEN_STAFF",
            "password": "+EunXaq*80",
            "dob": "2001-12-16",
            "telephone": "031.520.4316",
            "gender": "Male",
            "address": "374 Melissa Keys, East Jimmytown, DC 20955",
            "email": "bryancombs@gmail.com",
            "salary": 104250
        },
        {
            "id": "E016",
            "name": "Levi Atkinson",
            "role": "KITCHEN_STAFF",
            "password": "E^0LaUo+kh",
            "dob": "1972-07-06",
            "telephone": "+1-260-654-4547x888",
            "gender": "Female",
            "address": "799 Wise Hills Suite 529, South Sarahport, NY 70434",
            "email": "wsmith@odom.net",
            "salary": 104608
        },
        {
            "id": "E017",
            "name": "Kaitlyn Parker",
            "role": "KITCHEN_STAFF",
            "password": "&EYdOyClK3",
            "dob": "1978-08-01",
            "telephone": "3065805090",
            "gender": "Female",
            "address": "255 Bailey Walks, North Lisa, PA 15893",
            "email": "travis28@flores.info",
            "salary": 62709
        },
        {
            "id": "E018",
            "name": "Caroline Smith",
            "role": "KITCHEN_STAFF",
            "password": "c3CIsei(&I",
            "dob": "1986-06-05",
            "telephone": "852.513.9626",
            "gender": "Female",
            "address": "81496 Johns Extension, East Joseph, SD 74481",
            "email": "wallacebenjamin@gmail.com",
            "salary": 57755
        },
        {
            "id": "E019",
            "name": "Michelle Martinez",
            "role": "KITCHEN_ADMIN",
            "password": "+C5IFjOPML",
            "dob": "1994-06-08",
            "telephone": "(369)086-6615",
            "gender": "Female",
            "address": "82436 Vazquez Ford, Castroville, SD 09271",
            "email": "joseph95@jimenez.com",
            "salary": 78043
        },
        {
            "id": "E020",
            "name": "Kayla Hernandez",
            "role": "HR_ADMIN",
            "password": "Sv+4UjLfjk",
            "dob": "1984-07-02",
            "telephone": "022.984.9027x7199",
            "gender": "Female",
            "address": "7256 Sims Parks, Parkshaven, AR 72096",
            "email": "dyernatalie@fuller.com",
            "salary": 106227
        },
        {
            "id": "E021",
            "name": "Robert Pena",
            "role": "INVENTORY_ADMIN",
            "password": "Y$85Lwz4i@",
            "dob": "1998-02-12",
            "telephone": "001-736-465-4537",
            "gender": "Female",
            "address": "00490 Choi Expressway Apt. 675, Toddport, CT 40575",
            "email": "mrogers@russell-mitchell.org",
            "salary": 141586
        },
        {
            "id": "E022",
            "name": "Justin Perry",
            "role": "KITCHEN_STAFF",
            "password": "89IUjyf&@1",
            "dob": "1971-09-14",
            "telephone": "001-369-023-4735",
            "gender": "Male",
            "address": "5134 Mitchell Squares Apt. 207, Kaylaborough, AK 83658",
            "email": "mallen@davis.com",
            "salary": 110140
        },
        {
            "id": "E023",
            "name": "Kaitlyn Taylor",
            "role": "HR_ADMIN",
            "password": "56G6c(c_&v",
            "dob": "1992-06-14",
            "telephone": "001-737-483-1831",
            "gender": "Female",
            "address": "6447 Williams Flat, Steinside, WV 03219",
            "email": "jsmith@gmail.com",
            "salary": 58958
        },
        {
            "id": "E024",
            "name": "Latoya Elliott",
            "role": "INVENTORY_ADMIN",
            "password": "gp78B9YAu$",
            "dob": "1971-12-04",
            "telephone": "2019551365",
            "gender": "Male",
            "address": "965 Lloyd Motorway, Lake Melissa, DC 63219",
            "email": "flynncindy@hotmail.com",
            "salary": 128063
        },
        {
            "id": "E025",
            "name": "John Wiley",
            "role": "INVENTORY_ADMIN",
            "password": "$CZktqamF1",
            "dob": "1975-09-25",
            "telephone": "615-721-8759x60172",
            "gender": "Male",
            "address": "084 Troy Ridges, North William, GA 17421",
            "email": "paulagarcia@lozano.net",
            "salary": 69093
        },
        {
            "id": "E026",
            "name": "Corey Kim",
            "role": "INVENTORY_ADMIN",
            "password": "LyRhYLSD#5",
            "dob": "1966-06-04",
            "telephone": "243-399-9431x685",
            "gender": "Male",
            "address": "261 Amanda Neck Apt. 670, New Daniel, NJ 19227",
            "email": "stephanie88@yahoo.com",
            "salary": 64110
        },
        {
            "id": "E027",
            "name": "Jerry Romero",
            "role": "KITCHEN_STAFF",
            "password": "4$0fTBbOJ(",
            "dob": "2003-12-22",
            "telephone": "001-305-590-6462x3251",
            "gender": "Male",
            "address": "90826 Cody Ranch Suite 615, Buckshire, MT 22712",
            "email": "catherine27@baker-swanson.com",
            "salary": 101676
        },
        {
            "id": "E028",
            "name": "Beth Lang",
            "role": "KITCHEN_STAFF",
            "password": "#05Z1HRe&8",
            "dob": "2007-04-27",
            "telephone": "109.076.8342x42577",
            "gender": "Female",
            "address": "0984 Erin Ford Apt. 168, Baileyland, NE 40876",
            "email": "erivas@gmail.com",
            "salary": 83306
        },
        {
            "id": "E029",
            "name": "Michaela Holland",
            "role": "software engineer",
            "password": "6OGvf+Sk@#",
            "dob": "1997-05-07",
            "telephone": "001-130-327-8927",
            "gender": "Female",
            "address": "PSC 8862, Box 1286, APO AE 15022",
            "email": "hannabruce@henderson-morgan.com",
            "salary": 111401
        },
        {
            "id": "E030",
            "name": "Lisa Burke DVM",
            "role": "KITCHEN_ADMIN",
            "password": "7y5DkRlxA#",
            "dob": "1965-10-31",
            "telephone": "195-776-6687",
            "gender": "Male",
            "address": "PSC 1152, Box 3689, APO AE 54958",
            "email": "kbowman@munoz.com",
            "salary": 81772
        },
        {
            "id": "E031",
            "name": "Melissa Duffy",
            "role": "INVENTORY_ADMIN",
            "password": "1l+1ZfCb%I",
            "dob": "1976-09-13",
            "telephone": "001-279-777-9836",
            "gender": "Male",
            "address": "18251 Timothy Ford, Port Shannon, OR 80956",
            "email": "lucas31@yahoo.com",
            "salary": 141494
        },
        {
            "id": "E032",
            "name": "Jonathan Kelley",
            "role": "HR_ADMIN",
            "password": "cMa2ZtCq*U",
            "dob": "1982-04-19",
            "telephone": "118.638.4422x3161",
            "gender": "Male",
            "address": "141 Michelle Inlet Suite 374, Mitchellburgh, CA 87365",
            "email": "catherinelee@johnson-scott.net",
            "salary": 109419
        },
        {
            "id": "E033",
            "name": "Katherine Deleon",
            "role": "KITCHEN_ADMIN",
            "password": "_HIny0UhS+",
            "dob": "1993-07-18",
            "telephone": "001-461-343-6862",
            "gender": "Female",
            "address": "490 Angela Oval Apt. 345, Amyview, SC 95696",
            "email": "diana74@baker.org",
            "salary": 53252
        },
        {
            "id": "E034",
            "name": "Maria Anderson PhD",
            "role": "HR_ADMIN",
            "password": "2aR%Zj)j_6",
            "dob": "2007-01-24",
            "telephone": "(040)592-0153x254",
            "gender": "Male",
            "address": "84694 Rodgers Freeway Apt. 997, East Anthony, MO 00811",
            "email": "victorhenderson@hotmail.com",
            "salary": 115140
        },
        {
            "id": "E035",
            "name": "April Montoya",
            "role": "HR_ADMIN",
            "password": "$a0AODmkeS",
            "dob": "1997-10-19",
            "telephone": "920.719.2360x82329",
            "gender": "Male",
            "address": "766 Glenn Spurs Suite 989, Karenshire, WV 90858",
            "email": "michael55@golden.com",
            "salary": 55592
        },
        {
            "id": "E036",
            "name": "Eddie Jordan",
            "role": "HR_ADMIN",
            "password": "+lzYbEcW4Y",
            "dob": "2004-10-27",
            "telephone": "637-837-3263x84407",
            "gender": "Male",
            "address": "4437 Catherine Landing Apt. 289, West Amandafurt, AZ 12091",
            "email": "trobbins@holland-reed.org",
            "salary": 124746
        },
        {
            "id": "E037",
            "name": "Michaela Phillips",
            "role": "KITCHEN_STAFF",
            "password": "2dJ8MTUd%B",
            "dob": "1980-06-14",
            "telephone": "582.671.4305",
            "gender": "Male",
            "address": "393 Pennington Key Apt. 474, Davenportshire, TN 67842",
            "email": "tyler37@hodge.com",
            "salary": 75254
        },
        {
            "id": "E038",
            "name": "Cory Perez",
            "role": "INVENTORY_ADMIN",
            "password": "_St2SFGt#3",
            "dob": "1976-05-30",
            "telephone": "424.111.1843x49279",
            "gender": "Female",
            "address": "8471 Holloway Lodge Apt. 774, Crystalchester, LA 97287",
            "email": "pholloway@shaw.com",
            "salary": 77664
        },
        {
            "id": "E039",
            "name": "Michaela Wilson",
            "role": "KITCHEN_ADMIN",
            "password": "y@TAy5Do7F",
            "dob": "1966-04-15",
            "telephone": "001-891-697-3418x08680",
            "gender": "Male",
            "address": "4157 Butler Avenue Suite 708, Josephfort, TN 33334",
            "email": "dennislarry@sanchez.biz",
            "salary": 93328
        },
        {
            "id": "E040",
            "name": "Robin Hunt",
            "role": "KITCHEN_STAFF",
            "password": "03C1p%yP)K",
            "dob": "1995-01-06",
            "telephone": "001-847-868-6278x66225",
            "gender": "Female",
            "address": "11483 Jensen Circle, Port Phillip, TN 80719",
            "email": "gonzalezmichaela@gmail.com",
            "salary": 55880
        },
        {
            "id": "E041",
            "name": "Andrea Rowe",
            "role": "HR_ADMIN",
            "password": "f6VSK_ao#M",
            "dob": "1991-06-17",
            "telephone": "909.771.3091x075",
            "gender": "Male",
            "address": "99713 Coffey Port, North Anthony, NJ 20987",
            "email": "fowlermichael@hotmail.com",
            "salary": 136018
        },
        {
            "id": "E042",
            "name": "Dana Dunn",
            "role": "KITCHEN_ADMIN",
            "password": "s3Yoz6KN)s",
            "dob": "1965-09-21",
            "telephone": "0873217362",
            "gender": "Male",
            "address": "40113 Brown Expressway Apt. 083, South Erikachester, OR 53462",
            "email": "hcherry@parker.com",
            "salary": 66159
        },
        {
            "id": "E043",
            "name": "Shawn Kelley",
            "role": "KITCHEN_ADMIN",
            "password": "%2XZQ@ocNd",
            "dob": "1991-02-07",
            "telephone": "+1-606-258-0760",
            "gender": "Female",
            "address": "3616 Matthew Mews Apt. 618, East Carolbury, KY 01575",
            "email": "amber09@gmail.com",
            "salary": 108759
        },
        {
            "id": "E044",
            "name": "Bailey Cervantes",
            "role": "KITCHEN_ADMIN",
            "password": "aa6XUkchX+",
            "dob": "1971-11-14",
            "telephone": "028.159.1262x3758",
            "gender": "Female",
            "address": "USCGC Medina, FPO AP 00703",
            "email": "james10@newman.com",
            "salary": 79292
        },
        {
            "id": "E045",
            "name": "Shelby Patel",
            "role": "software engineer",
            "password": "(7bLF4q!x4",
            "dob": "1981-07-22",
            "telephone": "001-580-177-8370",
            "gender": "Female",
            "address": "82245 Linda Locks Suite 132, Wardport, NJ 27454",
            "email": "alexandra00@spencer.org",
            "salary": 85818
        },
        {
            "id": "E046",
            "name": "Raymond Lopez",
            "role": "HR_ADMIN",
            "password": "sNz8C9Er5&",
            "dob": "2001-12-30",
            "telephone": "(664)559-7095",
            "gender": "Female",
            "address": "USNS Miller, FPO AE 91278",
            "email": "joseph19@gmail.com",
            "salary": 51123
        },
        {
            "id": "E047",
            "name": "Michael Lin",
            "role": "KITCHEN_ADMIN",
            "password": "Mc7Nj$Sdm+",
            "dob": "1972-04-04",
            "telephone": "(910)624-9446x844",
            "gender": "Female",
            "address": "28440 Louis Ports Apt. 068, North Michellehaven, MA 34171",
            "email": "ucampbell@gmail.com",
            "salary": 120986
        },
        {
            "id": "E048",
            "name": "Heather Smith",
            "role": "INVENTORY_ADMIN",
            "password": "__6TBYt*bl",
            "dob": "1981-09-30",
            "telephone": "437-302-6870x24518",
            "gender": "Female",
            "address": "02795 Collins Burg Suite 678, Smithmouth, SD 54862",
            "email": "joshua39@gonzalez.com",
            "salary": 51191
        },
        {
            "id": "E049",
            "name": "Robert Richardson",
            "role": "KITCHEN_ADMIN",
            "password": "z6qFF*fH$6",
            "dob": "1969-05-17",
            "telephone": "265-731-6777x631",
            "gender": "Male",
            "address": "4221 Andrews Knolls Suite 325, Port Brendanbury, IN 36493",
            "email": "jaimehernandez@gray.com",
            "salary": 118394
        },
        {
            "id": "E050",
            "name": "Leslie Miller",
            "role": "software engineer",
            "password": "h^C0lxBj5u",
            "dob": "1982-03-13",
            "telephone": "001-863-857-4946",
            "gender": "Male",
            "address": "USS Small, FPO AP 65906",
            "email": "aliciarhodes@yahoo.com",
            "salary": 58553
        },
        {
            "id": "E6969",
            "name": "Ubetta",
            "role": "Human Resource Manager",
            "password": "Anjana12345.",
            "dob": "1983-02-15",
            "telephone": "4911249283",
            "salary":65000,
            "gender": "Female",
            "address": "435 Elizabeth Stravenue, Williamsland, CA 32888",
            "email": "anjanaape2002@gmail.com"
        },
        {
            "id": "E7070",
            "name": "Chamilka",
            "role": "Inventory Manager",
            "password": "Chamilka12345.",
            "dob": "1983-02-15",
            "telephone": "4911249283",
            "salary":65000,
            "gender": "male",
            "address": "435 Elizabeth Stravenue, Williamsland, CA 32888",
            "email": "Chamilka2002@gmail.com"
          }
    ];

    const ingredients: Prisma.IngredientCreateInput[] = [
        {
          "name": "Tomato",
          "price_per_unit": 19,
          "quantity": "36",
          "type": "Vegetables",
          "priority": 2
        },
        {
          "name": "Apple",
          "price_per_unit": 13,
          "quantity": "53",
          "type": "Fruits",
          "priority": 3
        },
        {
          "name": "Wheat Flour",
          "price_per_unit": 7,
          "quantity": "95",
          "type": "Grains & Cereals",
          "priority": 2
        },
        {
          "name": "Condensed Milk",
          "price_per_unit": 8,
          "quantity": "29",
          "type": "Dairy Products",
          "priority": 1
        },
        {
          "name": "Minced Beef",
          "price_per_unit": 2,
          "quantity": "80",
          "type": "Meat & Poultry",
          "priority": 2
        },
        {
          "name": "Paprika",
          "price_per_unit": 17,
          "quantity": "90",
          "type": "Spices & Condiments",
          "priority": 1
        },
        {
          "name": "Iced Tea",
          "price_per_unit": 2,
          "quantity": "66",
          "type": "Beverages",
          "priority": 3
        },
        {
          "name": "Olive Oil",
          "price_per_unit": 5,
          "quantity": "49",
          "type": "Oils & Fats",
          "priority": 1
        },
        {
          "name": "Chocolate",
          "price_per_unit": 7,
          "quantity": "44",
          "type": "Bakery & Sweets",
          "priority": 1
        },
        {
          "name": "Canned Corn",
          "price_per_unit": 15,
          "quantity": "23",
          "type": "Processed & Canned",
          "priority": 1
        },
        {
          "name": "Pepper",
          "price_per_unit": 14,
          "quantity": "46",
          "type": "Vegetables",
          "priority": 1
        },
        {
          "name": "Strawberry",
          "price_per_unit": 5,
          "quantity": "61",
          "type": "Fruits",
          "priority": 3
        },
        {
          "name": "Millet",
          "price_per_unit": 9,
          "quantity": "80",
          "type": "Grains & Cereals",
          "priority": 1
        },
        {
          "name": "Paneer",
          "price_per_unit": 19,
          "quantity": "43",
          "type": "Dairy Products",
          "priority": 1
        },
        {
          "name": "Pork",
          "price_per_unit": 13,
          "quantity": "41",
          "type": "Meat & Poultry",
          "priority": 2
        },
        {
          "name": "Garlic Powder",
          "price_per_unit": 11,
          "quantity": "93",
          "type": "Spices & Condiments",
          "priority": 2
        },
        {
          "name": "Soft Drink",
          "price_per_unit": 20,
          "quantity": "64",
          "type": "Beverages",
          "priority": 1
        },
        {
          "name": "Margarine",
          "price_per_unit": 10,
          "quantity": "82",
          "type": "Oils & Fats",
          "priority": 2
        },
        {
          "name": "Cookies",
          "price_per_unit": 1,
          "quantity": "41",
          "type": "Bakery & Sweets",
          "priority": 3
        },
        {
          "name": "Canned Tomatoes",
          "price_per_unit": 9,
          "quantity": "39",
          "type": "Processed & Canned",
          "priority": 1
        },
        {
          "name": "Pepper",
          "price_per_unit": 3,
          "quantity": "49",
          "type": "Vegetables",
          "priority": 2
        },
        {
          "name": "Banana",
          "price_per_unit": 20,
          "quantity": "48",
          "type": "Fruits",
          "priority": 2
        },
        {
          "name": "Millet",
          "price_per_unit": 13,
          "quantity": "40",
          "type": "Grains & Cereals",
          "priority": 2
        },
        {
          "name": "Yogurt",
          "price_per_unit": 16,
          "quantity": "65",
          "type": "Dairy Products",
          "priority": 1
        },
        {
          "name": "Duck",
          "price_per_unit": 12,
          "quantity": "53",
          "type": "Meat & Poultry",
          "priority": 2
        },
        {
          "name": "Cinnamon",
          "price_per_unit": 9,
          "quantity": "34",
          "type": "Spices & Condiments",
          "priority": 1
        },
        {
          "name": "Soft Drink",
          "price_per_unit": 3,
          "quantity": "81",
          "type": "Beverages",
          "priority": 1
        },
        {
          "name": "Lard",
          "price_per_unit": 10,
          "quantity": "43",
          "type": "Oils & Fats",
          "priority": 3
        },
        {
          "name": "Donut",
          "price_per_unit": 9,
          "quantity": "31",
          "type": "Bakery & Sweets",
          "priority": 2
        },
        {
          "name": "Canned Tomatoes",
          "price_per_unit": 10,
          "quantity": "36",
          "type": "Processed & Canned",
          "priority": 2
        },
        {
          "name": "Broccoli",
          "price_per_unit": 3,
          "quantity": "79",
          "type": "Vegetables",
          "priority": 2
        },
        {
          "name": "Strawberry",
          "price_per_unit": 12,
          "quantity": "23",
          "type": "Fruits",
          "priority": 2
        },
        {
          "name": "Rye",
          "price_per_unit": 19,
          "quantity": "84",
          "type": "Grains & Cereals",
          "priority": 3
        },
        {
          "name": "Cream",
          "price_per_unit": 13,
          "quantity": "23",
          "type": "Dairy Products",
          "priority": 1
        },
        {
          "name": "Pork",
          "price_per_unit": 4,
          "quantity": "28",
          "type": "Meat & Poultry",
          "priority": 3
        },
        {
          "name": "Coriander",
          "price_per_unit": 13,
          "quantity": "11",
          "type": "Spices & Condiments",
          "priority": 2
        },
        {
          "name": "Tea",
          "price_per_unit": 20,
          "quantity": "57",
          "type": "Beverages",
          "priority": 2
        },
        {
          "name": "Sunflower Oil",
          "price_per_unit": 4,
          "quantity": "90",
          "type": "Oils & Fats",
          "priority": 1
        },
        {
          "name": "Croissant",
          "price_per_unit": 17,
          "quantity": "86",
          "type": "Bakery & Sweets",
          "priority": 1
        },
        {
          "name": "Peanut Butter",
          "price_per_unit": 19,
          "quantity": "11",
          "type": "Processed & Canned",
          "priority": 2
        },
        {
          "name": "Cauliflower",
          "price_per_unit": 15,
          "quantity": "99",
          "type": "Vegetables",
          "priority": 3
        },
        {
          "name": "Orange",
          "price_per_unit": 12,
          "quantity": "82",
          "type": "Fruits",
          "priority": 2
        },
        {
          "name": "Barley",
          "price_per_unit": 15,
          "quantity": "41",
          "type": "Grains & Cereals",
          "priority": 1
        },
        {
          "name": "Buttermilk",
          "price_per_unit": 13,
          "quantity": "78",
          "type": "Dairy Products",
          "priority": 1
        },
        {
          "name": "Minced Beef",
          "price_per_unit": 14,
          "quantity": "45",
          "type": "Meat & Poultry",
          "priority": 2
        },
        {
          "name": "Coriander",
          "price_per_unit": 8,
          "quantity": "87",
          "type": "Spices & Condiments",
          "priority": 2
        },
        {
          "name": "Iced Tea",
          "price_per_unit": 6,
          "quantity": "18",
          "type": "Beverages",
          "priority": 2
        },
        {
          "name": "Ghee",
          "price_per_unit": 17,
          "quantity": "58",
          "type": "Oils & Fats",
          "priority": 1
        },
        {
          "name": "Pastry",
          "price_per_unit": 3,
          "quantity": "15",
          "type": "Bakery & Sweets",
          "priority": 1
        },
        {
          "name": "Canned Soup",
          "price_per_unit": 6,
          "quantity": "33",
          "type": "Processed & Canned",
          "priority": 1
        },
        {
          "name": "Potato",
          "price_per_unit": 14,
          "quantity": "13",
          "type": "Vegetables",
          "priority": 2
        },
        {
          "name": "Papaya",
          "price_per_unit": 6,
          "quantity": "97",
          "type": "Fruits",
          "priority": 1
        },
        {
          "name": "Buckwheat",
          "price_per_unit": 7,
          "quantity": "43",
          "type": "Grains & Cereals",
          "priority": 1
        },
        {
          "name": "Paneer",
          "price_per_unit": 14,
          "quantity": "26",
          "type": "Dairy Products",
          "priority": 2
        },
        {
          "name": "Sausage",
          "price_per_unit": 5,
          "quantity": "87",
          "type": "Meat & Poultry",
          "priority": 3
        },
        {
          "name": "Coriander",
          "price_per_unit": 2,
          "quantity": "36",
          "type": "Spices & Condiments",
          "priority": 2
        },
        {
          "name": "Tea",
          "price_per_unit": 10,
          "quantity": "73",
          "type": "Beverages",
          "priority": 1
        },
        {
          "name": "Canola Oil",
          "price_per_unit": 7,
          "quantity": "83",
          "type": "Oils & Fats",
          "priority": 2
        },
        {
          "name": "Brownie",
          "price_per_unit": 6,
          "quantity": "80",
          "type": "Bakery & Sweets",
          "priority": 3
        },
        {
          "name": "Pickles",
          "price_per_unit": 5,
          "quantity": "25",
          "type": "Processed & Canned",
          "priority": 2
        },
        {
          "name": "Broccoli",
          "price_per_unit": 20,
          "quantity": "99",
          "type": "Vegetables",
          "priority": 3
        },
        {
          "name": "Apple",
          "price_per_unit": 1,
          "quantity": "15",
          "type": "Fruits",
          "priority": 3
        },
        {
          "name": "Buckwheat",
          "price_per_unit": 4,
          "quantity": "60",
          "type": "Grains & Cereals",
          "priority": 2
        },
        {
          "name": "Cheese",
          "price_per_unit": 13,
          "quantity": "52",
          "type": "Dairy Products",
          "priority": 3
        },
        {
          "name": "Sausage",
          "price_per_unit": 13,
          "quantity": "66",
          "type": "Meat & Poultry",
          "priority": 3
        },
        {
          "name": "Turmeric",
          "price_per_unit": 11,
          "quantity": "38",
          "type": "Spices & Condiments",
          "priority": 3
        },
        {
          "name": "Coconut Water",
          "price_per_unit": 12,
          "quantity": "93",
          "type": "Beverages",
          "priority": 3
        },
        {
          "name": "Vegetable Oil",
          "price_per_unit": 10,
          "quantity": "74",
          "type": "Oils & Fats",
          "priority": 3
        },
        {
          "name": "Chocolate",
          "price_per_unit": 19,
          "quantity": "47",
          "type": "Bakery & Sweets",
          "priority": 1
        },
        {
          "name": "Canned Peas",
          "price_per_unit": 13,
          "quantity": "68",
          "type": "Processed & Canned",
          "priority": 3
        },
        {
          "name": "Lettuce",
          "price_per_unit": 2,
          "quantity": "33",
          "type": "Vegetables",
          "priority": 3
        },
        {
          "name": "Grapes",
          "price_per_unit": 10,
          "quantity": "83",
          "type": "Fruits",
          "priority": 2
        },
        {
          "name": "Millet",
          "price_per_unit": 13,
          "quantity": "66",
          "type": "Grains & Cereals",
          "priority": 2
        },
        {
          "name": "Condensed Milk",
          "price_per_unit": 6,
          "quantity": "63",
          "type": "Dairy Products",
          "priority": 2
        },
        {
          "name": "Sausage",
          "price_per_unit": 9,
          "quantity": "89",
          "type": "Meat & Poultry",
          "priority": 1
        },
        {
          "name": "Chili Powder",
          "price_per_unit": 19,
          "quantity": "36",
          "type": "Spices & Condiments",
          "priority": 1
        },
        {
          "name": "Lemonade",
          "price_per_unit": 3,
          "quantity": "78",
          "type": "Beverages",
          "priority": 2
        },
        {
          "name": "Palm Oil",
          "price_per_unit": 12,
          "quantity": "77",
          "type": "Oils & Fats",
          "priority": 2
        },
        {
          "name": "Chocolate",
          "price_per_unit": 15,
          "quantity": "52",
          "type": "Bakery & Sweets",
          "priority": 3
        },
        {
          "name": "Baked Beans",
          "price_per_unit": 7,
          "quantity": "46",
          "type": "Processed & Canned",
          "priority": 2
        },
        {
          "name": "Spinach",
          "price_per_unit": 4,
          "quantity": "53",
          "type": "Vegetables",
          "priority": 1
        },
        {
          "name": "Strawberry",
          "price_per_unit": 16,
          "quantity": "97",
          "type": "Fruits",
          "priority": 3
        },
        {
          "name": "Millet",
          "price_per_unit": 9,
          "quantity": "62",
          "type": "Grains & Cereals",
          "priority": 2
        },
        {
          "name": "Yogurt",
          "price_per_unit": 7,
          "quantity": "18",
          "type": "Dairy Products",
          "priority": 2
        },
        {
          "name": "Chicken Breast",
          "price_per_unit": 16,
          "quantity": "58",
          "type": "Meat & Poultry",
          "priority": 2
        },
        {
          "name": "Ginger",
          "price_per_unit": 5,
          "quantity": "54",
          "type": "Spices & Condiments",
          "priority": 3
        },
        {
          "name": "Lemonade",
          "price_per_unit": 7,
          "quantity": "95",
          "type": "Beverages",
          "priority": 3
        },
        {
          "name": "Coconut Oil",
          "price_per_unit": 9,
          "quantity": "30",
          "type": "Oils & Fats",
          "priority": 1
        },
        {
          "name": "Donut",
          "price_per_unit": 11,
          "quantity": "57",
          "type": "Bakery & Sweets",
          "priority": 1
        },
        {
          "name": "Pickles",
          "price_per_unit": 8,
          "quantity": "17",
          "type": "Processed & Canned",
          "priority": 2
        },
        {
          "name": "Carrot",
          "price_per_unit": 10,
          "quantity": "20",
          "type": "Vegetables",
          "priority": 1
        },
        {
          "name": "Blueberry",
          "price_per_unit": 6,
          "quantity": "31",
          "type": "Fruits",
          "priority": 2
        },
        {
          "name": "Oats",
          "price_per_unit": 7,
          "quantity": "22",
          "type": "Grains & Cereals",
          "priority": 2
        },
        {
          "name": "Cream",
          "price_per_unit": 5,
          "quantity": "47",
          "type": "Dairy Products",
          "priority": 1
        },
        {
          "name": "Chicken Breast",
          "price_per_unit": 17,
          "quantity": "15",
          "type": "Meat & Poultry",
          "priority": 1
        },
        {
          "name": "Coriander",
          "price_per_unit": 10,
          "quantity": "81",
          "type": "Spices & Condiments",
          "priority": 2
        },
        {
          "name": "Smoothie",
          "price_per_unit": 16,
          "quantity": "58",
          "type": "Beverages",
          "priority": 1
        },
        {
          "name": "Vegetable Oil",
          "price_per_unit": 2,
          "quantity": "75",
          "type": "Oils & Fats",
          "priority": 1
        },
        {
          "name": "Chocolate",
          "price_per_unit": 20,
          "quantity": "60",
          "type": "Bakery & Sweets",
          "priority": 2
        },
        {
          "name": "Baked Beans",
          "price_per_unit": 20,
          "quantity": "68",
          "type": "Processed & Canned",
          "priority": 2
        }
      ];

  try {
    // Create users
    for (const user of users) {
      await userService.create(user);
    }
    console.log('Users created successfully.');

    // Create meals
    const meals: Prisma.MealCreateInput[] = [];
    for (const meal of meals) {
      await mealService.createWithIngredients(meal, []);
    }
    console.log('Meals created successfully.');

    // Create ingredients
    for (const ingredient of ingredients) {
      await ingredientsService.create(ingredient);
    }
    console.log('Ingredients created successfully.');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await databaseService.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  });