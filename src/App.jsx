import './App.css'
import { ConnectButton } from './components/ConnectButton'
import { TokenLaunchpad } from './components/TokenLaunchPad'
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <ConnectButton />
      <TokenLaunchpad />
    </>
  )
}

export default App