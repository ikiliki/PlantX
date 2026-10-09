import { GreenhouseBackLink, GreenhouseTabs } from './GreenhouseTabs'

export default {
  title: 'Greenhouse/GreenhouseTabs',
  component: GreenhouseTabs,
}

export const Mine = () => <GreenhouseTabs value="mine" />
export const Global = () => <GreenhouseTabs value="global" />
export const BackToAll = () => <GreenhouseBackLink />
