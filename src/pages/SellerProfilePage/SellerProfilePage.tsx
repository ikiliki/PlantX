import { useParams } from 'react-router-dom'
import { SellerProfile } from '../../features/sellers/components/SellerProfile/SellerProfile'
import { useServerSlices } from '../../mock/useServerSlices'
import { Page } from './SellerProfilePage.styles'

export function SellerProfilePage() {
  const { id = '' } = useParams()
  useServerSlices(['users'])
  return (
    <Page>
      <SellerProfile userId={id} />
    </Page>
  )
}
