import LogoImage from '@/images/logos/primary.png'
import Image from 'next/image'

export function Logo() {
  return <Image src={LogoImage} alt="Dreams Built" width={110} height={130} />
}
