import { Dependencies } from '@/core/_redux_/dependencies'
import { AppStore, createStore } from '@/core/_redux_/createStore'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaRemoteDeviceRepository } from '@/infra/device-repository/prisma.remote-device.repository'
import { PrismaSirensRepository } from '@/infra/sirens-repository/prisma.sirens-repository'

export async function initializeApp(
  dependencies: Dependencies,
): Promise<AppStore> {
  const {
    blockSessionRepository,
    blocklistRepository,
    deviceRepository,
    sirensRepository,
  } = dependencies

  if (blockSessionRepository instanceof PrismaBlockSessionRepository) {
    await blockSessionRepository.initialize()
  }

  if (blocklistRepository instanceof PrismaBlocklistRepository) {
    await blocklistRepository.initialize()
  }

  if (deviceRepository instanceof PrismaRemoteDeviceRepository) {
    await deviceRepository.initialize()
  }

  if (sirensRepository instanceof PrismaSirensRepository) {
    await sirensRepository.initialize()
  }

  const store = createStore(dependencies)
  await store.dispatch(loadUser()).unwrap()
  return store
}
