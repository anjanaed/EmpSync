import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample organization ID - you may need to adjust this based on your existing data
const ORG_ID = 'O001';

// Employee IDs that need orders
const EMPLOYEE_IDS_FOR_ORDERS = ['O001E007', 'O001E002', 'O001E006', 'O001E005', 'O001E001'];

// Helper function to generate random date within last 45 days
function getRandomDateWithin45Days(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 45);
  const randomDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return randomDate;
}

// Helper function to generate random time for order placement
function getRandomTime(): Date {
  const date = getRandomDateWithin45Days();
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Generate sample user data
function generateUsers(count: number) {
  const genders = ['Male', 'Female', 'Other'];
  const roles = ['Employee', 'Manager', 'Supervisor', 'Admin'];
  const languages = ['English', 'Sinhala', 'Tamil'];
  
  const firstNames = [
    'Amara', 'Nimal', 'Kumari', 'Saman', 'Priya', 'Kamal', 'Sanduni', 'Kasun', 'Chamini', 'Ruwan',
    'Malini', 'Sunil', 'Rashini', 'Dinesh', 'Pavani', 'Gayan', 'Niluka', 'Tharindu', 'Upeksha', 'Hasitha',
    'Dilani', 'Mahesh', 'Samanthi', 'Chamara', 'Ishara', 'Lakmal', 'Thilini', 'Nuwan', 'Sachini', 'Dilan',
    'Madhavi', 'Asanka', 'Chathuri', 'Buddhika', 'Shyamali', 'Prasad', 'Indunil', 'Jeewan', 'Sachith', 'Manori',
    'Lahiru', 'Chathurika', 'Ravindu', 'Darshana', 'Subodhi', 'Thissa', 'Nimali', 'Roshan', 'Shanika', 'Chathura'
  ];
  
  const lastNames = [
    'Silva', 'Perera', 'Fernando', 'Mendis', 'Jayawardena', 'Rajapaksa', 'Wickramasinghe', 'Gunawardena', 
    'Senanayake', 'Bandara', 'Wijesinghe', 'Amarasinghe', 'Dissanayake', 'Ranasinghe', 'Gunasekara',
    'Weerasinghe', 'Karunaratne', 'Liyanage', 'Samaraweera', 'Jayasuriya', 'Rathnayake', 'Kumara',
    'Seneviratne', 'Weerasekara', 'Abeysekara', 'Dharmasena', 'Wanasinghe', 'Nanayakkara', 'Madusanka',
    'Herath', 'Pathirana', 'Rodrigo', 'Abeywardena', 'Gamage', 'Wickremaratne', 'Kodithuwakku'
  ];

  const users = [];
  
  // First, create the specific employee IDs that need orders
  for (let i = 0; i < EMPLOYEE_IDS_FOR_ORDERS.length; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const empId = EMPLOYEE_IDS_FOR_ORDERS[i];
    
    users.push({
      id: empId,
      empNo: empId,
      name: `${firstName} ${lastName}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      dob: `${1980 + Math.floor(Math.random() * 25)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      telephone: `+94${70 + Math.floor(Math.random() * 7)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      gender: genders[Math.floor(Math.random() * genders.length)],
      address: `No. ${Math.floor(Math.random() * 200) + 1}, ${lastName} Road, Colombo ${Math.floor(Math.random() * 15) + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@empsync.lk`,
      salary: 50000 + Math.floor(Math.random() * 150000),
      passkey: Math.floor(Math.random() * 900000) + 100000,
      language: languages[Math.floor(Math.random() * languages.length)],
      height: 150 + Math.floor(Math.random() * 40),
      weight: 50 + Math.floor(Math.random() * 50),
      organizationId: ORG_ID,
    });
  }
  
  // Generate the remaining users
  for (let i = EMPLOYEE_IDS_FOR_ORDERS.length; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const empId = `O001E${String(i + 8).padStart(3, '0')}`;
    
    users.push({
      id: empId,
      empNo: empId,
      name: `${firstName} ${lastName}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      dob: `${1980 + Math.floor(Math.random() * 25)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      telephone: `+94${70 + Math.floor(Math.random() * 7)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      gender: genders[Math.floor(Math.random() * genders.length)],
      address: `No. ${Math.floor(Math.random() * 200) + 1}, ${firstName} Street, Colombo ${Math.floor(Math.random() * 15) + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@empsync.lk`,
      salary: 50000 + Math.floor(Math.random() * 150000),
      passkey: Math.floor(Math.random() * 900000) + 100000,
      language: languages[Math.floor(Math.random() * languages.length)],
      height: 150 + Math.floor(Math.random() * 40),
      weight: 50 + Math.floor(Math.random() * 50),
      organizationId: ORG_ID,
    });
  }
  
  return users;
}

// Generate orders for specific employees
function generateOrdersForEmployee(employeeId: string, orderCount: number) {
  const orders = [];
  const mealTypes = [1, 2, 3]; // Breakfast, Lunch, Dinner IDs
  const possibleMeals = ['1', '2', '3', '4', '5']; // Sample meal IDs
  
  for (let i = 0; i < orderCount; i++) {
    const orderDate = getRandomDateWithin45Days();
    const orderPlacedTime = getRandomTime();
    const mealTypeId = mealTypes[Math.floor(Math.random() * mealTypes.length)];
    const numMeals = Math.floor(Math.random() * 3) + 1; // 1-3 meals per order
    const meals = [];
    
    for (let j = 0; j < numMeals; j++) {
      meals.push(possibleMeals[Math.floor(Math.random() * possibleMeals.length)]);
    }
    
    orders.push({
      employeeId,
      orgId: ORG_ID,
      mealTypeId,
      meals,
      orderDate,
      orderPlacedTime,
      price: Math.round((numMeals * (200 + Math.random() * 500)) * 100) / 100, // Random price between 200-700 per meal
      serve: Math.random() > 0.3, // 70% chance order is served
    });
  }
  
  return orders;
}

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check if organization exists, create if not
    let org = await prisma.organization.findUnique({
      where: { id: ORG_ID }
    });
    
    if (!org) {
      console.log('📦 Creating organization...');
      org = await prisma.organization.create({
        data: {
          id: ORG_ID,
          name: 'EmpSync Corporation',
          contactNumber: '+94112345678',
          address: 'No. 123, Business District, Colombo 01',
          contactEmail: 'admin@empsync.lk',
        }
      });
      console.log('✅ Organization created');
    }
    
    // Create meal types if they don't exist
    const mealTypes = [
      { id: 1, name: 'Breakfast', time: ['07:00', '09:00'] },
      { id: 2, name: 'Lunch', time: ['12:00', '14:00'] },
      { id: 3, name: 'Dinner', time: ['18:00', '20:00'] }
    ];
    
    for (const mealType of mealTypes) {
      await prisma.mealType.upsert({
        where: { id: mealType.id },
        update: {},
        create: {
          id: mealType.id,
          name: mealType.name,
          orgId: ORG_ID,
          time: mealType.time,
          isDefault: true,
          date: new Date(),
        }
      });
    }
    console.log('✅ Meal types created/updated');
    
    // Create sample meals if they don't exist
    const meals = [
      { id: 1, nameEnglish: 'Rice and Curry', nameSinhala: 'බත් සහ කරී', nameTamil: 'சாதம் மற்றும் கறி', price: 250.00 },
      { id: 2, nameEnglish: 'Fried Rice', nameSinhala: 'ෆ්‍රයිඩ් රයිස්', nameTamil: 'வறுத்த சாதம்', price: 300.00 },
      { id: 3, nameEnglish: 'Noodles', nameSinhala: 'නූඩ්ල්ස්', nameTamil: 'நூடுல்ஸ்', price: 280.00 },
      { id: 4, nameEnglish: 'Sandwich', nameSinhala: 'සැන්ඩ්විච්', nameTamil: 'சாண்ட்விச்', price: 200.00 },
      { id: 5, nameEnglish: 'Kottu', nameSinhala: 'කොත්තු', nameTamil: 'கொத்து', price: 350.00 }
    ];
    
    for (const meal of meals) {
      await prisma.meal.upsert({
        where: { id: meal.id },
        update: {},
        create: {
          id: meal.id,
          orgId: ORG_ID,
          nameEnglish: meal.nameEnglish,
          nameSinhala: meal.nameSinhala,
          nameTamil: meal.nameTamil,
          description: `Delicious ${meal.nameEnglish}`,
          price: meal.price,
          category: ['Main Course'],
        }
      });
    }
    console.log('✅ Sample meals created/updated');
    
    // Generate and insert users
    console.log('👥 Creating 50 users...');
    const users = generateUsers(50);
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log('✅ 50 users created/updated');
    
    // Generate orders for specific employees
    console.log('📋 Creating orders for specific employees...');
    for (const employeeId of EMPLOYEE_IDS_FOR_ORDERS) {
      console.log(`  📝 Creating ~135 orders for employee ${employeeId}...`);
      const orders = generateOrdersForEmployee(employeeId, 135);
      
      for (const order of orders) {
        await prisma.order.create({
          data: order,
        });
      }
      console.log(`  ✅ Created ${orders.length} orders for ${employeeId}`);
    }
    
    // Summary
    const totalUsers = await prisma.user.count({ where: { organizationId: ORG_ID } });
    const totalOrders = await prisma.order.count({ where: { orgId: ORG_ID } });
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • Total users: ${totalUsers}`);
    console.log(`   • Total orders: ${totalOrders}`);
    console.log(`   • Employees with ~135 orders: ${EMPLOYEE_IDS_FOR_ORDERS.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });