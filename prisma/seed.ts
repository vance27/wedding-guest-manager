import { PrismaClient, RsvpStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVGuest {
  'first name': string;
  'last name': string;
  'mailing address': string;
  'phone number': string;
  email: string;
  'address 1': string;
  'address 2': string;
  city: string;
  state: string;
  'postal code': string;
  country: string;
  tags: string;
  party: string;
  rsvp: string;
  'meal / wedding': string;
  'leave a note!': string;
  relationships: string;
}

function parseCSV(csvContent: string): CSVGuest[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const guest: any = {};
    headers.forEach((header, index) => {
      guest[header] = values[index] || '';
    });

    return guest as CSVGuest;
  }).filter(guest => guest['first name'] && guest['first name'].trim());
}

function mapRsvpStatus(rsvp: string): RsvpStatus {
  switch (rsvp.toLowerCase()) {
    case 'joyfully accept':
      return RsvpStatus.ACCEPTED;
    case 'regretfully decline':
      return RsvpStatus.DECLINED;
    default:
      return RsvpStatus.PENDING;
  }
}

function buildAddress(guest: CSVGuest): string | null {
  const parts = [
    guest['address 1'],
    guest['address 2'],
    guest.city,
    guest.state,
    guest['postal code'],
    guest.country
  ].filter(part => part && part.trim());

  return parts.length > 0 ? parts.join(', ') : null;
}

function mapDietaryRestrictions(meal: string): string | null {
  if (!meal || !meal.trim()) return null;

  // Map the meal choices to dietary restrictions
  switch (meal.toLowerCase()) {
    case 'vegan (chef\'s choice)':
      return 'Vegan';
    case 'steak with red wine sauce':
      return 'No restrictions';
    case 'seared salmon with avocado salsa':
      return 'No restrictions';
    default:
      return meal.trim();
  }
}

async function main() {
  try {
    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'guest-list.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const guests = parseCSV(csvContent);

    console.log(`Found ${guests.length} guests in CSV file`);

    // Clear existing data
    await prisma.guest.deleteMany();
    console.log('Cleared existing guest data');

    // Create guests
    for (const csvGuest of guests) {
      try {
        const guest = await prisma.guest.create({
          data: {
            firstName: csvGuest['first name'].trim(),
            lastName: csvGuest['last name'].trim(),
            email: csvGuest.email.trim() || null,
            phone: csvGuest['phone number'].trim() || null,
            address: buildAddress(csvGuest),
            rsvpStatus: mapRsvpStatus(csvGuest.rsvp),
            dietaryRestrictions: mapDietaryRestrictions(csvGuest['meal / wedding']),
            notes: csvGuest['leave a note!'].trim() || null,
          },
        });

        console.log(`Created guest: ${guest.firstName} ${guest.lastName}`);
      } catch (error) {
        console.error(`Error creating guest ${csvGuest['first name']} ${csvGuest['last name']}:`, error);
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });