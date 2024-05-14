import {config} from 'dotenv'
config()

export const PORT = process.env.PORT || 3000

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_PORT = process.env.DB_PORT || 3306
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || ''
export const DB_DATABASE = process.env.DB_DATABASE || 'companydb'

export const SECRET_KEY = process.env.SECRET_KEY || ''


export const getDate = (format) => {
    const now = new Date();
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // Month is zero-based
    const day = String(now.getDate()).padStart(2, '0')
  
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    switch (format) {
        case 'Y-m-d H:i:s':
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            break;
        case 'Y-m-d':
            return `${year}-${month}-${day}`
            break;
        case 'H:i:s':
            return `${hours}:${minutes}:${seconds}`
            break;    
        default:
            return null
            break;
    }
  }

export const formatDate_Ymd = (date) => {
    const fecha = new Date(date);
    return fecha.getFullYear() + "-" + ("0" + (fecha.getMonth() + 1)).slice(-2) + "-" + ("0" + fecha.getDate()).slice(-2)
}

export const formatDate_YmdHis = (date) => {
    const fecha = new Date(date);
    return fecha.getFullYear() + "-" + ("0" + (fecha.getMonth() + 1)).slice(-2) + "-" + ("0" + fecha.getDate()).slice(-2) + " " + ('0' + fecha.getHours()).slice(-2) + ":" + ('0' + fecha.getMinutes()).slice(-2) + ":" + ('0' + fecha.getSeconds()).slice(-2)
}

export const currencyFormat = (mount) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(mount)
    return formattedAmount
}