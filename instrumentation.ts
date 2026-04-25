// Подавляем шумный лог `[nextra] Error while loading …` для 404-запросов,
// которые Nextra корректно отдаёт через notFound(), но всё равно пишет
// в console.log как ERROR. В продакшене сюда непрерывно бьют сканеры
// (.env, swagger-ui.html, .git/config, login.action, …) — без фильтра
// логи замусорены до нечитаемости.
//
// См. node_modules/nextra/dist/server/utils.js — logger.error это
// `console.log.bind(null, '-', '\x1B[31merror\x1B[0m', '[nextra]')`.
export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const NEXTRA_TAG = '[nextra]'
  const NOT_FOUND_PREFIX = 'Error while loading'
  const origLog = console.log
  console.log = (...args: unknown[]) => {
    if (
      args[2] === NEXTRA_TAG &&
      typeof args[3] === 'string' &&
      args[3].startsWith(NOT_FOUND_PREFIX)
    ) {
      return
    }
    origLog(...args)
  }
}
