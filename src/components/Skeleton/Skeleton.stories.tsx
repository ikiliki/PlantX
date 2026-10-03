import { SkeletonBar } from './Skeleton'

export default {
  title: 'Components/Skeleton',
  component: SkeletonBar,
}

export const Lines = () => (
  <div style={{ display: 'grid', gap: 10, width: 320 }}>
    <SkeletonBar width="40%" height={10} />
    <SkeletonBar height={18} />
    <SkeletonBar width="70%" height={18} />
  </div>
)

export const Avatar = () => <SkeletonBar width="36px" height={36} round />
