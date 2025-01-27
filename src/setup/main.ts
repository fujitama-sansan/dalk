import fs from 'fs'
import path from 'path'
import { LocalPrismaAccessor } from '../main/localDb/LocalPrismaAccessor'

function main(): void {
  const envPath = path.normalize(path.join(__dirname, '../../.env'))
  console.log(`envPath: ${envPath}`)
  if (!fs.existsSync(envPath)) {
    const envContent = `LOCAL_DATABASE_URL=${LocalPrismaAccessor.datasourceUrl}`
    fs.writeFileSync(envPath, envContent)
    console.log(`created .env file: \n${envContent}`)
  } else {
    console.log('.env file already exists')
  }
}

main()
