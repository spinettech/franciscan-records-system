import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { PrismaClient } from 'prisma-generated'
import { autoUpdater } from 'electron-updater'
import crypto from 'crypto'
import fs from 'fs'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import BetterSqlite3 from 'better-sqlite3'
import { dialog } from 'electron'

// Handle uncaught exceptions in main process
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  dialog.showErrorBox(
    'A JavaScript error occurred in the main process',
    error.stack || error.message
  )
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
  dialog.showErrorBox(
    'An unhandled promise rejection occurred',
    reason instanceof Error ? reason.stack || reason.message : String(reason)
  )
})

const isDev = is.dev && process.env['ELECTRON_RENDERER_URL']
const DB_PATH = isDev
  ? join(__dirname, '../../prisma/dev.db')
  : join(app.getPath('userData'), 'database.db')

// Fix for Prisma in production: point to the unpacked engine
if (!isDev) {
  const possiblePaths = [
    join(process.resourcesPath, 'node_modules/prisma-generated/query_engine-windows.dll.node'),
    join(process.resourcesPath, 'app.asar.unpacked/node_modules/prisma-generated/query_engine-windows.dll.node'),
    join(app.getAppPath(), '../app.asar.unpacked/node_modules/prisma-generated/query_engine-windows.dll.node')
  ]

  for (const qePath of possiblePaths) {
    if (fs.existsSync(qePath)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = qePath
      console.log('[Init] Found Prisma Engine at:', qePath)
      break
    }
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${DB_PATH.replace(/\\/g, '/')}`
    }
  }
})

// If packaged, ensure the database exists in userData
if (!isDev) {
  if (!fs.existsSync(DB_PATH)) {
    const seedPath = join(process.resourcesPath, 'prisma/dev.db')
    try {
      if (fs.existsSync(seedPath)) {
        fs.copyFileSync(seedPath, DB_PATH)
        console.log('[Init] Database seeded to userData.')
      }
    } catch (err) {
      console.error('[Init] Failed to seed database:', err)
    }
  }
}

// Note: prisma instantiation moved up to ensure env vars are used

// --- SCHEMA MIGRATION HELPER (uses better-sqlite3 directly for reliability) ---
function ensureSchemaUpdated() {
  try {
    console.log('[Migration] Opening DB for schema check at:', DB_PATH);
    const db = new BetterSqlite3(DB_PATH);

    const addCol = (table: string, col: string, def: string) => {
      try {
        const exists = db.prepare(`PRAGMA table_info("${table}")`).all().some((r: any) => r.name === col);
        if (!exists) {
          db.prepare(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${def}`).run();
          console.log(`[Migration] Added ${table}.${col}`);
        }
      } catch (e: any) {
        console.warn(`[Migration] Could not add ${table}.${col}:`, e.message);
      }
    };

    const tableExists = (table: string) =>
      (db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table) as any)?.name === table;

    const createTable = (table: string, definition: string) => {
      if (!tableExists(table)) {
        db.prepare(`CREATE TABLE "${table}" (${definition})`).run();
        console.log(`[Migration] Created missing table: ${table}`);
      }
    };

    // === Ensure all tables exist ===
    createTable('Obedience', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "sisterId" TEXT NOT NULL,
      "communityName" TEXT,
      "diocese" TEXT,
      "parish" TEXT,
      "institution" TEXT,
      "country" TEXT,
      "city" TEXT,
      "startDate" DATETIME,
      "endDate" DATETIME,
      "officeHeld" TEXT,
      "ministryType" TEXT,
      "achievements" TEXT,
      "remarks" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('FamilyMember', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "sisterId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "relationship" TEXT,
      "phone" TEXT,
      "whatsapp" TEXT,
      "address" TEXT,
      "isEmergency" INTEGER DEFAULT 0,
      "isNextOfKin" INTEGER DEFAULT 0,
      "isDeceased" INTEGER DEFAULT 0,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('Correspondence', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "sisterId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "direction" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "sender" TEXT,
      "recipient" TEXT,
      "date" DATETIME,
      "filePath" TEXT,
      "status" TEXT DEFAULT 'pending',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('Community', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "location" TEXT,
      "diocese" TEXT,
      "superiorName" TEXT,
      "contactPhone" TEXT,
      "capacity" INTEGER,
      "apostolateType" TEXT,
      "isActive" INTEGER DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('CommunityReport', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "communityId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "folderDate" DATETIME NOT NULL,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('Document', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "sisterId" TEXT,
      "reportId" TEXT,
      "title" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "filePath" TEXT NOT NULL,
      "fileType" TEXT,
      "fileSize" INTEGER,
      "category" TEXT,
      "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('Notification', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "date" DATETIME NOT NULL,
      "isRead" INTEGER DEFAULT 0,
      "sisterId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('Transaction', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "amount" REAL NOT NULL,
      "date" DATETIME NOT NULL,
      "description" TEXT,
      "reference" TEXT,
      "paymentMethod" TEXT,
      "recordedBy" TEXT,
      "communityId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    createTable('Leadership', `
      "id" TEXT NOT NULL PRIMARY KEY,
      "sisterId" TEXT,
      "title" TEXT NOT NULL,
      "name" TEXT,
      "termStart" DATETIME,
      "termEnd" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    // === Add missing columns to Sister (Incremental Updates) ===
    addCol('Sister', 'region', 'TEXT');
    addCol('Sister', 'religiousName', 'TEXT');
    addCol('Sister', 'passportPhoto', 'TEXT');
    addCol('Sister', 'nationality', 'TEXT');
    addCol('Sister', 'originState', 'TEXT');
    addCol('Sister', 'firstProfession', 'DATETIME');
    addCol('Sister', 'finalVows', 'DATETIME');
    addCol('Sister', 'currentCommunity', 'TEXT');
    addCol('Sister', 'currentRole', 'TEXT');
    addCol('Sister', 'phone', 'TEXT');
    addCol('Sister', 'email', 'TEXT');
    addCol('Sister', 'emergencyContact', 'TEXT');
    addCol('Sister', 'emergencyContactAddress', 'TEXT');
    addCol('Sister', 'healthNotes', 'TEXT');
    addCol('Sister', 'bloodGroup', 'TEXT');
    addCol('Sister', 'nextOfKinName', 'TEXT');
    addCol('Sister', 'nextOfKinRelationship', 'TEXT');
    addCol('Sister', 'nextOfKinPhone', 'TEXT');
    addCol('Sister', 'nextOfKinEmail', 'TEXT');
    addCol('Sister', 'nextOfKinAddress', 'TEXT');
    addCol('Sister', 'homeAddress', 'TEXT');
    addCol('Sister', 'baptismDetails', 'TEXT');
    addCol('Sister', 'education', 'TEXT');
    addCol('Sister', 'skills', 'TEXT');
    addCol('Sister', 'certifications', 'TEXT');
    addCol('Sister', 'languages', 'TEXT');
    addCol('Sister', 'notes', 'TEXT');

    db.close();
    console.log('[Migration] Schema check complete.');
  } catch (err: any) {
    console.error('[Migration] Critical migration error:', err.message);
  }
}

// --- CRYPTO UTILS ---
const HASH_CONFIG = {
  iterations: 10000,
  keylen: 64,
  digest: 'sha512',
  saltLen: 16
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(HASH_CONFIG.saltLen).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, HASH_CONFIG.iterations, HASH_CONFIG.keylen, HASH_CONFIG.digest).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':')
  const hash = crypto.pbkdf2Sync(password, salt, HASH_CONFIG.iterations, HASH_CONFIG.keylen, HASH_CONFIG.digest).toString('hex')
  return hash === originalHash
}

// Ensure directories for uploads exist
const UPLOADS_PATH = join(app.getPath('userData'), 'uploads')
const PHOTOS_PATH = join(UPLOADS_PATH, 'photos')
const DOCS_PATH = join(UPLOADS_PATH, 'docs')

if (!fs.existsSync(UPLOADS_PATH)) fs.mkdirSync(UPLOADS_PATH, { recursive: true })
if (!fs.existsSync(PHOTOS_PATH)) fs.mkdirSync(PHOTOS_PATH, { recursive: true })
if (!fs.existsSync(DOCS_PATH)) fs.mkdirSync(DOCS_PATH, { recursive: true })

async function seedAdmin() {
  console.log('[Init] Checking for admin user...')
  try {
    const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } })
    if (!adminExists) {
      console.log('[Init] Creating default admin user...')
      const passwordHash = hashPassword('sisteradmin2024')
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash,
          role: 'admin',
          fullName: 'FSIC Administrator'
        }
      })
      console.log('[Init] Default admin created successfully.')
    } else {
      console.log('[Init] Admin user already exists.')
    }
  } catch (error) {
    console.error('[Init] FAILED TO SEED ADMIN:', error)
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    icon: isDev ? join(__dirname, '../../public/logo.jpg') : join(__dirname, '../renderer/logo.jpg'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // --- AUTO UPDATER LOGIC ---
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-status', { status: 'checking', message: 'Checking for updates...' });
  });
  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-status', { status: 'available', message: 'Update available!', info });
  });
  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-status', { status: 'uptodate', message: 'System is up to date.' });
  });
  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-status', { status: 'error', message: 'Error checking for updates.', error: err.message });
  });
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-status', { status: 'downloading', message: 'Downloading update...', progress });
  });
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-status', { status: 'downloaded', message: 'Update downloaded. Restart to apply.' });
  });
}

// --- UPDATER IPC ---
ipcMain.handle('check-for-updates', async () => {
  try {
    return await autoUpdater.checkForUpdates();
  } catch (error: any) {
    console.error('[Updater] Error checking for updates:', error);
    throw error;
  }
});

ipcMain.handle('download-update', async () => {
  try {
    return await autoUpdater.downloadUpdate();
  } catch (error: any) {
    console.error('[Updater] Error downloading update:', error);
    throw error;
  }
});

ipcMain.handle('quit-and-install', () => {
  try {
    autoUpdater.quitAndInstall();
  } catch (error: any) {
    console.error('[Updater] Error during quit and install:', error);
    throw error;
  }
});

// --- AUTH HANDLERS ---
ipcMain.handle('login', async (_, { username, password }) => {
  console.log(`[IPC:Login] Attempt for user: ${username}`)
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    console.log(`[IPC:Login] User found: ${!!user}`)

    if (!user) return { success: false, message: 'Invalid credentials' }

    const isValid = verifyPassword(password, user.passwordHash)
    console.log(`[IPC:Login] Password valid: ${isValid}`)

    if (!isValid) return { success: false, message: 'Invalid credentials' }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      }
    }
  } catch (error: any) {
    console.error('[IPC:Login] DATABASE ERROR:', error)
    return { success: false, message: `System Error: ${error.message}` }
  }
})

// --- USER & SETTINGS HANDLERS ---
ipcMain.handle('update-user', async (_, { id, data }: { id: string, data: any }) => {
  try {
    return await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        fullName: data.fullName,
        email: data.email
      }
    })
  } catch (error: any) {
    console.error('[IPC:UpdateUser] Error:', error)
    throw error
  }
})

ipcMain.handle('change-password', async (_, { id, oldPassword, newPassword }) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return { success: false, message: 'User not found' }

    const isValid = verifyPassword(oldPassword, user.passwordHash)
    if (!isValid) return { success: false, message: 'Current password incorrect' }

    const newHash = hashPassword(newPassword)
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newHash }
    })

    return { success: true }
  } catch (error: any) {
    console.error('[IPC:ChangePassword] Error:', error)
    return { success: false, message: error.message }
  }
})

// --- SISTER HANDLERS ---
ipcMain.handle('get-sisters', async (_, filters: any = {}) => {
  try {
    const { search, status, community } = filters
    let where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { religiousName: { contains: search } }
      ]
    }
    if (status) where.status = status
    if (community) where.currentCommunity = community

    return await prisma.sister.findMany({
      where,
      include: { Obediences: true, familyMembers: true },
      orderBy: { fullName: 'asc' }
    })
  } catch (error: any) {
    console.error('[IPC:get-sisters] Database Error:', error)
    throw error
  }
})

ipcMain.handle('get-sister', async (_, id: string) => {
  return await prisma.sister.findUnique({
    where: { id },
    include: {
      Obediences: { orderBy: { startDate: 'desc' } },
      correspondence: { orderBy: { date: 'desc' } },
      familyMembers: true
    }
  })
})

ipcMain.handle('delete-sister', async (_, id: string) => {
  return await prisma.sister.delete({ where: { id } })
})

ipcMain.handle('upsert-sister', async (_, { id, data }: { id?: string, data: any }) => {
  if (id) {
    return await prisma.sister.update({ where: { id }, data })
  } else {
    return await prisma.sister.create({ data })
  }
})

// --- CORRESPONDENCE HANDLERS ---
ipcMain.handle('get-correspondence', async (_, filters: any = {}) => {
  const { type, direction, search } = filters
  let where: any = {}

  if (type && type !== 'All') where.type = type
  if (direction && direction !== 'all') where.direction = direction
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { sender: { contains: search } },
      { recipient: { contains: search } }
    ]
  }

  return await prisma.correspondence.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { sister: true }
  })
})

ipcMain.handle('delete-correspondence', async (_, id: string) => {
  return await prisma.correspondence.delete({ where: { id } })
})

ipcMain.handle('upsert-correspondence', async (_, { id, data }: { id?: string, data: any }) => {
  if (data.date) data.date = new Date(data.date)
  if (id) {
    return await prisma.correspondence.update({ where: { id }, data })
  } else {
    return await prisma.correspondence.create({ data })
  }
})

// --- FINANCE HANDLERS ---
ipcMain.handle('get-transactions', async (_, filters: any = {}) => {
  const { type, category, startDate, endDate } = filters
  let where: any = {}

  if (type) where.type = type
  if (category) where.category = category
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate) where.date.lte = new Date(endDate)
  }

  return await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' }
  })
})

ipcMain.handle('upsert-transaction', async (_, { id, data }: { id?: string, data: any }) => {
  if (data.date) data.date = new Date(data.date)
  if (id) {
    return await prisma.transaction.update({ where: { id }, data })
  } else {
    return await prisma.transaction.create({ data })
  }
})

ipcMain.handle('delete-transaction', async (_, id: string) => {
  return await prisma.transaction.delete({ where: { id } })
})

ipcMain.handle('get-finance-stats', async () => {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const income = await prisma.transaction.aggregate({
    where: { type: 'income' },
    _sum: { amount: true }
  })

  const expenditure = await prisma.transaction.aggregate({
    where: { type: 'expenditure' },
    _sum: { amount: true }
  })

  const monthlyIncome = await prisma.transaction.aggregate({
    where: { type: 'income', date: { gte: firstDayOfMonth } },
    _sum: { amount: true }
  })

  const monthlyExpenditure = await prisma.transaction.aggregate({
    where: { type: 'expenditure', date: { gte: firstDayOfMonth } },
    _sum: { amount: true }
  })

  return {
    totalIncome: income._sum.amount || 0,
    totalExpenditure: expenditure._sum.amount || 0,
    monthlyIncome: monthlyIncome._sum.amount || 0,
    monthlyExpenditure: monthlyExpenditure._sum.amount || 0,
    balance: (income._sum.amount || 0) - (expenditure._sum.amount || 0)
  }
})

// --- OTHER HANDLERS ---
ipcMain.handle('get-communities', async () => {
  const communities = await prisma.community.findMany({
    orderBy: { name: 'asc' }
  })

  // Dynamically count sisters assigned to each community
  return await Promise.all(communities.map(async (c) => {
    const sisters = await prisma.sister.findMany({
      where: { currentCommunity: c.name },
      select: { id: true, fullName: true, religiousName: true, status: true, email: true, phone: true }
    })
    return { ...c, sistersCount: sisters.length, sisters }
  }))
})

ipcMain.handle('upsert-community', async (_, { id, data }: { id?: string, data: any }) => {
  if (id) {
    return await prisma.community.update({ where: { id }, data })
  } else {
    return await prisma.community.create({ data })
  }
})

ipcMain.handle('delete-community', async (_, id: string) => {
  return await prisma.community.delete({ where: { id } })
})

// --- COMMUNITY REPORT HANDLERS ---
ipcMain.handle('get-community-reports', async (_, communityId: string) => {
  return await prisma.communityReport.findMany({
    where: { communityId },
    orderBy: { folderDate: 'desc' }
  })
})

ipcMain.handle('upsert-community-report', async (_, { id, data }: { id?: string, data: any }) => {
  if (data.folderDate) data.folderDate = new Date(data.folderDate)
  
  if (id) {
    return await prisma.communityReport.update({ where: { id }, data })
  } else {
    return await prisma.communityReport.create({ data })
  }
})

ipcMain.handle('delete-community-report', async (_, id: string) => {
  return await prisma.communityReport.delete({ where: { id } })
})

ipcMain.handle('get-obediences', async (_, sisterId: string) => {
  return await prisma.Obedience.findMany({
    where: { sisterId },
    orderBy: { startDate: 'desc' }
  })
})

ipcMain.handle('upsert-obedience', async (_, data: any) => {
  const { sisterId, startDate, id: ObedienceId } = data
  const start = new Date(startDate)

  // Map only fields that exist in the Prisma Obedience model
  const ObedienceFields = {
    communityName: data.communityName,
    diocese: data.diocese,
    parish: data.parish,
    institution: data.institution,
    country: data.country,
    city: data.city,
    officeHeld: data.officeHeld,
    ministryType: data.ministryType,
    achievements: data.achievements,
    remarks: data.remarks,
  }

  if (ObedienceId) {
    // Update existing record
    const updateData: any = { ...ObedienceFields }
    if (startDate) updateData.startDate = new Date(startDate)
    if ('endDate' in data) updateData.endDate = data.endDate ? new Date(data.endDate) : null

    return await prisma.Obedience.update({
      where: { id: ObedienceId },
      data: updateData
    })
  } else {
    // Create new Obedience - Implement Chaining Logic

    // 1. Find previous active Obedience (endDate is null)
    const activeObedience = await prisma.Obedience.findFirst({
      where: { sisterId, endDate: null },
      orderBy: { startDate: 'desc' }
    })

    // 2. Close it if found
    if (activeObedience) {
      await prisma.Obedience.update({
        where: { id: activeObedience.id },
        data: { endDate: start }
      })
    }

    // 3. Create the new one
    const newObedience = await prisma.Obedience.create({
      data: {
        ...ObedienceFields,
        sisterId,
        startDate: start,
        endDate: data.endDate ? new Date(data.endDate) : null
      }
    })

    // 4. Sync Sister's current profile info
    await prisma.sister.update({
      where: { id: sisterId },
      data: {
        currentCommunity: data.communityName,
        currentRole: data.officeHeld
      }
    })

    return newObedience
  }
})

ipcMain.handle('get-notifications', async () => {
  const dbNotifications = await prisma.notification.findMany({
    where: { isRead: false },
    orderBy: { date: 'asc' }
  })

  // Generate dynamic reminders for birthdays, professions, and transfers
  const sisters = await prisma.sister.findMany({
    where: { status: { not: 'deceased' } },
    select: {
      id: true,
      fullName: true,
      dateOfBirth: true,
      firstProfession: true,
      finalVows: true,
      Obediences: {
        orderBy: { startDate: 'desc' },
        take: 1
      }
    }
  })

  const dynamicNotifications: any[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingWindow = 30 // Days to look ahead

  sisters.forEach(sister => {
    // 1. Check Birthday
    if (sister.dateOfBirth) {
      const dob = new Date(sister.dateOfBirth)
      let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
      if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1)

      const diffDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= upcomingWindow) {
        dynamicNotifications.push({
          id: `bday-${sister.id}-${nextBirthday.getFullYear()}`,
          title: diffDays === 0 ? "Birthday Today!" : "Upcoming Birthday",
          message: diffDays === 0 ? `Today is ${sister.fullName}'s birthday!` : `${sister.fullName}'s birthday is in ${diffDays} day(s)`,
          type: 'birthday',
          date: nextBirthday,
          isRead: false
        })
      }
    }

    // 2. Check Temporary Profession Anniversary
    if (sister.firstProfession) {
      const prof = new Date(sister.firstProfession)
      let nextAnniv = new Date(today.getFullYear(), prof.getMonth(), prof.getDate())
      if (nextAnniv < today) nextAnniv.setFullYear(today.getFullYear() + 1)

      const diffDays = Math.ceil((nextAnniv.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= upcomingWindow) {
        const years = nextAnniv.getFullYear() - prof.getFullYear()
        if (years > 0) {
          dynamicNotifications.push({
            id: `temp-prof-${sister.id}-${nextAnniv.getFullYear()}`,
            title: diffDays === 0 ? "Temp. Profession Anniversary" : "Upcoming Temp. Profession",
            message: diffDays === 0 ? `Today is ${sister.fullName}'s ${years}th Anniversary of Temp. Profession` : `${sister.fullName}'s Temp. Profession anniversary (${years} yrs) is in ${diffDays} day(s)`,
            type: 'anniversary',
            date: nextAnniv,
            isRead: false
          })
        }
      }
    }

    // 3. Check Perpetual Profession (Final Vows) Anniversary
    if (sister.finalVows) {
      const prof = new Date(sister.finalVows)
      let nextAnniv = new Date(today.getFullYear(), prof.getMonth(), prof.getDate())
      if (nextAnniv < today) nextAnniv.setFullYear(today.getFullYear() + 1)

      const diffDays = Math.ceil((nextAnniv.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= upcomingWindow) {
        const years = nextAnniv.getFullYear() - prof.getFullYear()
        if (years > 0) {
          const isJubilee = years % 25 === 0 || years === 40 || years === 60
          dynamicNotifications.push({
            id: `final-vows-${sister.id}-${nextAnniv.getFullYear()}`,
            title: isJubilee ? `${years}th Jubilee!` : (diffDays === 0 ? "Perpetual Vows Anniversary" : "Upcoming Perpetual Vows"),
            message: diffDays === 0 ? `Today is ${sister.fullName}'s ${years}th Anniversary of Final Vows` : `${sister.fullName}'s Final Vows anniversary (${years} yrs) is in ${diffDays} day(s)`,
            type: isJubilee ? 'jubilee' : 'anniversary',
            date: nextAnniv,
            isRead: false
          })
        }
      }
    }

    // 4. Check Upcoming Obedience / New Postings
    const latestObedience = sister.Obediences?.[0]
    if (latestObedience && latestObedience.startDate) {
      const start = new Date(latestObedience.startDate)
      start.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Only notify if it's in the future or exactly today
      if (diffDays >= 0 && diffDays <= 7) {
        dynamicNotifications.push({
          id: `transfer-${latestObedience.id}`,
          title: diffDays === 0 ? "Obedience Day Today!" : "Upcoming Obedience",
          message: diffDays === 0
            ? `${sister.fullName} is scheduled to start at ${latestObedience.communityName} today!`
            : `${sister.fullName} transfers to ${latestObedience.communityName} in ${diffDays} day(s)`,
          type: 'transfer',
          date: start,
          isRead: false
        })
      }
    }
  })

  // Combine and sort by date ascending
  const allNotifications = [...dbNotifications, ...dynamicNotifications]
  return allNotifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

ipcMain.handle('get-dashboard-stats', async () => {
  const total = await prisma.sister.count()
  const active = await prisma.sister.count({ where: { status: 'Active' } })
  const mission = await prisma.sister.count({ where: { status: 'on Mission' } })
  const exclaustration = await prisma.sister.count({ where: { status: 'Exclaustration' } })
  const deceased = await prisma.sister.count({ where: { status: 'Deceased' } })
  const dismissed = await prisma.sister.count({ where: { status: 'Dismissed' } })
  
  // Profession Stats based strictly on finalVows field
  const finallyProfessed = await prisma.sister.count({
    where: { 
      finalVows: { not: null }
    }
  })
  const notFinallyProfessed = await prisma.sister.count({
    where: { 
      finalVows: null
    }
  })

  const recentSisters = await prisma.sister.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  return { 
    total, 
    active, 
    mission, 
    exclaustration,
    deceased,
    dismissed,
    finallyProfessed, 
    notFinallyProfessed, 
    recentSisters 
  }
})

// --- LEADERSHIP HANDLERS ---
ipcMain.handle('get-leadership', async () => {
  return await prisma.leadership.findMany({
    include: { sister: true },
    orderBy: { createdAt: 'asc' }
  })
})

ipcMain.handle('upsert-leadership', async (_, { id, data }: { id?: string, data: any }) => {
  if (data.termStart) data.termStart = new Date(data.termStart)
  if (data.termEnd) data.termEnd = new Date(data.termEnd)
  
  if (id) {
    return await prisma.leadership.update({ where: { id }, data })
  } else {
    return await prisma.leadership.create({ data })
  }
})

ipcMain.handle('delete-leadership', async (_, id: string) => {
  return await prisma.leadership.delete({ where: { id } })
})

// --- EXPORT HANDLERS ---
ipcMain.handle('export-sisters', async (event, { format }) => {
  const sisters = await prisma.sister.findMany({
    orderBy: { fullName: 'asc' }
  })

  const window = BrowserWindow.fromWebContents(event.sender)
  const fileExtension = format === 'excel' ? 'xlsx' : 'pdf'

  const { filePath } = await dialog.showSaveDialog(window!, {
    title: `Export Sisters Directory (${format.toUpperCase()})`,
    defaultPath: `Sisters_Directory_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
    filters: [
      { name: format.toUpperCase(), extensions: [fileExtension] }
    ]
  })

  if (!filePath) return { success: false }

  try {
    if (format === 'excel') {
      const data = sisters.map((s: any) => ({
        'ID': s.id,
        'Official Name': s.fullName,
        'Religious Name': s.religiousName || '',
        'Date of Birth': s.dateOfBirth ? s.dateOfBirth.toLocaleDateString() : '',
        'Place of Birth': s.placeOfBirth || '',
        'Nationality': s.nationality || '',
        'Origin State': s.originState || '',
        'Origin Country': s.originCountry || '',
        'Temporary Profession': s.firstProfession ? s.firstProfession.toLocaleDateString() : '',
        'Perpetual Vows': s.finalVows ? s.finalVows.toLocaleDateString() : '',
        'Status': s.status,
        'Current Community': s.currentCommunity || '',
        'Current Role': s.currentRole || '',
        'Phone': s.phone || '',
        'Email': s.email || '',
        'Emergency Contact': s.emergencyContact || '',
        'Emergency Contact Address': s.emergencyContactAddress || '',
        'Blood Group': s.bloodGroup || '',
        'Next of Kin Name': s.nextOfKinName || '',
        'Next of Kin Relationship': s.nextOfKinRelationship || '',
        'Next of Kin Phone': s.nextOfKinPhone || '',
        'Next of Kin Email': s.nextOfKinEmail || '',
        'Next of Kin Address': s.nextOfKinAddress || '',
        'Home Address': s.homeAddress || '',
        'Baptism Details': s.baptismDetails || '',
        'Confirmation Details': s.confirmationDetails || '',
        'Health Notes': s.healthNotes || '',
        'Education': s.education || '',
        'Skills': s.skills || '',
        'Certifications': s.certifications || '',
        'Languages': s.languages || '',
        'General Notes': s.notes || '',
        'Created At': s.createdAt.toLocaleDateString()
      }))
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sisters Registry')
      XLSX.writeFile(workbook, filePath)
    } else {
      const doc = new jsPDF('l', 'mm', 'a4') // Landscape for more columns
      doc.setFontSize(20)
      doc.setTextColor(30, 58, 138) // Primary color
      doc.text('Franciscan Sisters Registry - Full Report', 14, 20)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 28)
      doc.text(`Total Records: ${sisters.length}`, 14, 33)

      const tableHeaders = [['S/N', 'Official Name', 'Religious Name', 'Birth Date', 'Status', 'Community', 'Phone', 'Profession']]
      const tableData = sisters.map((s: any, index: number) => [
        index + 1,
        s.fullName,
        s.religiousName || '-',
        s.dateOfBirth ? s.dateOfBirth.toLocaleDateString() : '-',
        s.status.toUpperCase(),
        s.currentCommunity || '-',
        s.phone || '-',
        s.firstProfession ? s.firstProfession.toLocaleDateString() : '-'
      ])

      // PDF is harder to show ALL columns without being messy, 
      // but we can add more crucial info here.
      // @ts-ignore
      doc.line(14, 35, 280, 35)

      let y = 45
      sisters.forEach((s: any, i: number) => {
        if (y > 180) { doc.addPage(); y = 20; }
        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont('helvetica', 'bold')
        doc.text(`${i + 1}. ${s.fullName} (${s.religiousName || 'No Religious Name'})`, 14, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Status: ${s.status} | Community: ${s.currentCommunity || 'N/A'} | Role: ${s.currentRole || 'N/A'}`, 14, y + 5)
        doc.text(`Birth: ${s.dateOfBirth?.toLocaleDateString() || 'N/A'} | Place: ${s.placeOfBirth || 'N/A'} | Nat: ${s.nationality || 'N/A'}`, 14, y + 10)
        doc.text(`Phone: ${s.phone || 'N/A'} | Email: ${s.email || 'N/A'}`, 14, y + 15)
        doc.text(`Emergency: ${s.emergencyContact || 'N/A'} (${s.emergencyContactAddress || 'N/A'})`, 14, y + 20)
        doc.line(14, y + 23, 280, y + 23)
        y += 30
      })

      const buffer = Buffer.from(doc.output('arraybuffer'))
      fs.writeFileSync(filePath, buffer)
    }
    return { success: true, filePath }
  } catch (error: any) {
    console.error('Export Error:', error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle('import-sisters', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const { filePaths } = await dialog.showOpenDialog(window!, {
    title: 'Import Sisters Registry (Excel)',
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] }],
    properties: ['openFile']
  })

  if (!filePaths || filePaths.length === 0) return { success: false, message: 'No file selected' }

  try {
    const workbook = XLSX.readFile(filePaths[0])
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: any[] = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) return { success: false, message: 'The selected file is empty' }

    let importedCount = 0
    let skippedCount = 0

    for (const row of data) {
      try {
        // Map Excel headers to Prisma field names
        // Flexible mapping: handles both 'Full Name' and 'fullName' etc.
        const sisterData: any = {
          fullName: row['Official Name'] || row['Full Name'] || row['fullName'] || row['Name'],
          religiousName: row['Religious Name'] || row['religiousName'],
        }

        // Format religious name
        if (sisterData.religiousName) {
          let name = String(sisterData.religiousName).trim();
          if (name) {
            if (!name.toLowerCase().startsWith('sr.')) {
              name = `Sr. ${name}`;
            }
            const upperName = name.toUpperCase();
            if (!upperName.endsWith(', OSF') && !upperName.endsWith(',OSF')) {
              name = `${name}, OSF`;
            }
          }
          sisterData.religiousName = name;
        }

        Object.assign(sisterData, {
          dateOfBirth: row['Date of Birth'] || row['dateOfBirth'] ? new Date(row['Date of Birth'] || row['dateOfBirth']) : null,
          placeOfBirth: row['Place of Birth'] || row['placeOfBirth'],
          nationality: row['Nationality'] || row['nationality'],
          originState: row['Origin State'] || row['originState'],
          originCountry: row['Origin Country'] || row['originCountry'],
          firstProfession: row['Temporary Profession'] || row['TemporaryProfession'] || row['First Profession'] || row['firstProfession'] ? new Date(row['Temporary Profession'] || row['TemporaryProfession'] || row['First Profession'] || row['firstProfession']) : null,
          finalVows: row['Perpetual Vows'] || row['PerpetualVows'] || row['Final Vows'] || row['finalVows'] ? new Date(row['Perpetual Vows'] || row['PerpetualVows'] || row['Final Vows'] || row['finalVows']) : null,
          status: (row['Status'] || row['status'] || 'active').toLowerCase(),
          currentCommunity: row['Current Community'] || row['currentCommunity'] || row['Community'],
          currentRole: row['Current Role'] || row['currentRole'] || row['Role'],
          phone: row['Phone'] || row['phone'],
          email: row['Email'] || row['email'],
          emergencyContact: row['Emergency Contact'] || row['emergencyContact'],
          emergencyContactAddress: row['Emergency Contact Address'] || row['emergencyContactAddress'],
          bloodGroup: row['Blood Group'] || row['bloodGroup'],
          nextOfKinName: row['Next of Kin Name'] || row['nextOfKinName'],
          nextOfKinRelationship: row['Next of Kin Relationship'] || row['nextOfKinRelationship'],
          nextOfKinPhone: row['Next of Kin Phone'] || row['nextOfKinPhone'],
          nextOfKinEmail: row['Next of Kin Email'] || row['nextOfKinEmail'],
          nextOfKinAddress: row['Next of Kin Address'] || row['nextOfKinAddress'],
          homeAddress: row['Home Address'] || row['homeAddress'],
          baptismDetails: row['Baptism Details'] || row['baptismDetails'],
          confirmationDetails: row['Confirmation Details'] || row['confirmationDetails'],
          healthNotes: row['Health Notes'] || row['healthNotes'],
          education: row['Education'] || row['education'],
          skills: row['Skills'] || row['skills'],
          certifications: row['Certifications'] || row['certifications'],
          languages: row['Languages'] || row['languages'],
          notes: row['General Notes'] || row['notes']
        })

        if (!sisterData.fullName) {
          skippedCount++
          continue
        }

        await prisma.sister.create({ data: sisterData })
        importedCount++
      } catch (rowErr) {
        console.error('Error importing row:', row, rowErr)
        skippedCount++
      }
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} records. ${skippedCount > 0 ? `Skipped ${skippedCount} invalid records.` : ''}`
    }
  } catch (error: any) {
    console.error('Import Error:', error)
    return { success: false, message: `Import failed: ${error.message}` }
  }
})

// --- FILE HANDLERS ---
ipcMain.handle('upload-photo', async (_, { id, buffer }: { id: string, buffer: Buffer }) => {
  const fileName = `${id}-${Date.now()}.png`
  const filePath = join(PHOTOS_PATH, fileName)
  fs.writeFileSync(filePath, buffer)
  return fileName
})

ipcMain.handle('upload-sister-document', async (_, { sisterId, title, category, fileName, buffer }: any) => {
  try {
    console.log(`[IPC:UploadDoc] Starting upload for sister ${sisterId}: ${fileName}`);
    const safeFileName = `${sisterId}-${Date.now()}-${fileName.replace(/\s+/g, '_')}`
    const filePath = join(DOCS_PATH, safeFileName)
    
    console.log(`[IPC:UploadDoc] Writing file to: ${filePath}`);
    fs.writeFileSync(filePath, buffer)
    
    console.log(`[IPC:UploadDoc] Creating database record...`);
    const doc = await prisma.document.create({
      data: {
        sisterId,
        title,
        category,
        fileName,
        filePath: safeFileName,
        fileType: fileName.split('.').pop() || 'unknown',
        fileSize: buffer.length
      }
    })
    console.log(`[IPC:UploadDoc] Success: ${doc.id}`);
    return doc;
  } catch (error: any) {
    console.error('[IPC:UploadDoc] ERROR:', error);
    throw error;
  }
})

ipcMain.handle('upload-report-document', async (_, { reportId, title, category, fileName, buffer }: any) => {
  try {
    console.log(`[IPC:UploadReportDoc] Starting upload for report ${reportId}: ${fileName}`);
    const safeFileName = `report-${reportId}-${Date.now()}-${fileName.replace(/\s+/g, '_')}`
    const filePath = join(DOCS_PATH, safeFileName)
    
    console.log(`[IPC:UploadReportDoc] Writing file to: ${filePath}`);
    fs.writeFileSync(filePath, buffer)
    
    console.log(`[IPC:UploadReportDoc] Creating database record...`);
    const doc = await prisma.document.create({
      data: {
        reportId,
        title,
        category,
        fileName,
        filePath: safeFileName,
        fileType: fileName.split('.').pop() || 'unknown',
        fileSize: buffer.length
      }
    })
    console.log(`[IPC:UploadReportDoc] Success: ${doc.id}`);
    return doc;
  } catch (error: any) {
    console.error('[IPC:UploadReportDoc] ERROR:', error);
    throw error;
  }
})

ipcMain.handle('get-report-documents', async (_, reportId: string) => {
  return await prisma.document.findMany({
    where: { reportId },
    orderBy: { uploadedAt: 'desc' }
  })
})

ipcMain.handle('get-sister-documents', async (_, sisterId: string) => {
  return await prisma.document.findMany({
    where: { sisterId },
    orderBy: { uploadedAt: 'desc' }
  })
})

ipcMain.handle('delete-sister-document', async (_, id: string) => {
  const doc = await prisma.document.findUnique({ where: { id } })
  if (doc && doc.filePath) {
    const fullPath = join(DOCS_PATH, doc.filePath)
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
  }
  return await prisma.document.delete({ where: { id } })
})

ipcMain.handle('open-document', async (_, fileName: string) => {
  const fullPath = join(DOCS_PATH, fileName)
  return await shell.openPath(fullPath)
})

ipcMain.handle('global-search', async (_, query: string) => {
  try {
    if (!query || query.length < 2) return { sisters: [], communities: [], documents: [] }

    const [sisters, communities, documents] = await Promise.all([
      prisma.sister.findMany({
        where: {
          OR: [
            { fullName: { contains: query } },
            { religiousName: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, fullName: true, religiousName: true, passportPhoto: true }
      }),
      prisma.community.findMany({
        where: { name: { contains: query } },
        take: 5,
        select: { id: true, name: true, location: true }
      }),
      prisma.document.findMany({
        where: { title: { contains: query } },
        take: 5,
        include: { 
          sister: { select: { fullName: true, religiousName: true } },
          report: { select: { title: true } }
        }
      })
    ])

    // Format the results to include consistent subtitles and navigation data
    const formattedDocuments = documents.map((d: any) => ({
      id: d.id,
      title: d.title,
      fileName: d.fileName,
      category: d.category,
      sisterId: d.sisterId,
      reportId: d.reportId,
      subtitle: d.sister ? (d.sister.religiousName || d.sister.fullName) : (d.report ? d.report.title : d.category)
    }))

    return { sisters, communities, documents: formattedDocuments }
  } catch (error) {
    console.error('[IPC:global-search] Error:', error)
    return { sisters: [], communities: [], documents: [] }
  }
})
ipcMain.handle('get-apostolates', async () => {
  return await prisma.apostolate.findMany({ orderBy: { name: 'asc' } })
})

ipcMain.handle('upsert-apostolate', async (_, id: string | null, name: string) => {
  if (id) {
    return await prisma.apostolate.update({ where: { id }, data: { name } })
  }
  return await prisma.apostolate.create({ data: { name } })
})

ipcMain.handle('delete-apostolate', async (_, id: string) => {
  return await prisma.apostolate.delete({ where: { id } })
})

async function seedApostolates() {
  console.log('[Init] Checking for default apostolates...')
  const defaults = [
    'Education', 'Healthcare', 'Social Services', 'Pastoral', 
    'Missions', 'Administration', 'Formation', 'Hospitality'
  ]
  try {
    const count = await prisma.apostolate.count()
    if (count === 0) {
      console.log('[Init] Seeding default apostolates...')
      for (const name of defaults) {
        await prisma.apostolate.create({ data: { name } })
      }
    }
  } catch (err) {
    console.error('[Init] Error seeding apostolates:', err)
  }
}

app.whenReady().then(async () => {
  // Set app user model id for windows notifications
  electronApp.setAppUserModelId('com.franciscan.records')

  // Seed default admin user if not exists
  await seedAdmin()
  await seedApostolates()

  // Ensure database schema is up to date (Production migration)
  ensureSchemaUpdated()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

