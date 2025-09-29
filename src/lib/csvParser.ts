import fs from 'fs';
import path from 'path';
import { cleanParticipant, formatPhoneNumber } from './participantUtils';

export interface Participant {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export function parseParticipantsFromCSV(): Participant[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'replay.csv');

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const participants: Participant[] = [];

    console.log('Reading CSV file with', lines.length, 'lines');

    // Skip header row and parse participant names from the first column
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma but be careful with Arabic text
      const columns = line.split(',');
      if (columns.length >= 1) {
        let name = columns[0].trim();
        let phone = columns.length > 1 ? columns[1].trim() : '';
        let email = columns.length > 2 ? columns[2].trim() : '';

        // Remove any extra quotes or spaces
        name = name.replace(/^["']|["']$/g, '').trim();
        phone = phone.replace(/^["']|["']$/g, '').trim();
        email = email.replace(/^["']|["']$/g, '').trim();

        // Format phone number if present
        if (phone) {
          phone = formatPhoneNumber(phone);
        }

        // Clean and validate participant data
        const cleanedParticipant = cleanParticipant({
          id: i,
          name,
          phone: phone || undefined,
          email: email || undefined
        });

        // Skip header patterns or invalid entries
        if (cleanedParticipant &&
            !name.includes('الاسم الرباعي') && // Skip header
            !name.includes('رقم الجوال') && // Skip header
            !name.includes('البريد الالكتروني') && // Skip header
            name !== ':' && // Skip lone colons
            name !== '-' && // Skip lone dashes
            !name.includes('?????') &&
            !name.includes('????') &&
            !name.includes('??????')) {

          participants.push(cleanedParticipant);
        } else if (name.length > 0) {
          console.log('Skipped participant:', name, 'at line', i);
        }
      }
    }

    console.log('Parsed participants from CSV:', participants.length);
    console.log('First few participants:', participants.slice(0, 5).map(p => p.name));
    console.log('Total lines in CSV:', lines.length);

    // Count occurrences of each name (case-insensitive)
    const nameCount = new Map<string, number>();
    for (const participant of participants) {
      const normalizedName = participant.name.toLowerCase().trim();
      nameCount.set(normalizedName, (nameCount.get(normalizedName) || 0) + 1);
    }

    // Filter out participants whose names appear more than once
    const uniqueParticipants: Participant[] = [];
    const duplicateNames = new Set<string>();

    for (const participant of participants) {
      const normalizedName = participant.name.toLowerCase().trim();
      const count = nameCount.get(normalizedName) || 0;

      if (count > 1) {
        duplicateNames.add(normalizedName);
        console.log('Excluding duplicate participant:', participant.name);
      } else {
        uniqueParticipants.push(participant);
      }
    }

    if (duplicateNames.size > 0) {
      console.log('Names with duplicates (all entries excluded):', Array.from(duplicateNames));
    }

    console.log('Participants after excluding all duplicates:', uniqueParticipants.length);
    return uniqueParticipants;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

// Deterministic random number generator using seed
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

export function selectWinner(participants: Participant[], seed?: number): {
  winner: Participant;
  seed: number;
  timestamp: string;
  winnerIndex: number;
} {
  const actualSeed = seed || Date.now();
  const rng = new SeededRandom(actualSeed);
  const winnerIndex = rng.nextInt(participants.length);

  return {
    winner: participants[winnerIndex],
    seed: actualSeed,
    timestamp: new Date().toISOString(),
    winnerIndex
  };
}