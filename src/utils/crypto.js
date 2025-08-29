import CryptoJS from 'crypto-js'

/**
 * MD5加密函数
 * @param {string} str - 需要加密的字符串
 * @returns {string} - MD5加密后的字符串
 */
export function md5(str) {
  return CryptoJS.MD5(str).toString()
}

/**
 * 验证密码是否为默认密码
 * @param {string} hashedPassword - 已加密的密码
 * @returns {boolean} - 是否为默认密码
 */
export function isDefaultPassword(hashedPassword) {
  const defaultPasswordMD5 = md5('love') // 默认密码"love"的MD5值
  return hashedPassword === defaultPasswordMD5
}

/**
 * 验证用户名是否为默认用户名
 * @param {string} username - 用户名
 * @returns {boolean} - 是否为默认用户名
 */
export function isDefaultUsername(username) {
  return username === 'admin'
}