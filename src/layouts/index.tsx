import { Outlet } from 'umi';

export default function Layout() {
  return (
    <div className='app'>
      <Outlet />
    </div>
  );
}
