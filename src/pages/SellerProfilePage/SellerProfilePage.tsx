import { useParams } from 'react-router-dom'
import { SellerProfile } from '../../features/sellers/components/SellerProfile/SellerProfile'
import { Page } from './SellerProfilePage.styles'

export function SellerProfilePage() {
  const { id = '' } = useParams()
  return (
    <Page>
      <SellerProfile userId={id} />
    </Page>
  )
}
