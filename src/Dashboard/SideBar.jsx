import { Sidebar } from 'flowbite-react';
import {
  HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag,
  HiSupport, HiTable, HiUser, HiViewBoards, HiOutlineCloudUpload,
  HiArrowSmLeft, HiHeart
} from 'react-icons/hi';

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import MobileDashboard from './MobileDashboard';
import { Link } from 'react-router-dom';  // <-- import Link

const SideBar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      {/* Desktop Sidebar */}
      <Sidebar aria-label="Sidebar with content separator example" className='hidden md:block'>
        <Sidebar.Logo
          as={Link}               // <-- đổi thành Link
          to="/"
          img="https://static.vecteezy.com/system/resources/previews/036/437/096/large_2x/illustration-of-book-vector.jpg"
          className='w-10 h-10 rounded-full'
          imgAlt="Flowbite logo"
        >
          <p>{user?.login || "Demo User"}</p>
        </Sidebar.Logo>

        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item as={Link} to="/admin/dashboard" icon={HiChartPie}>
              Dashboard
            </Sidebar.Item>

            {/* Chỉ hiển thị nếu role là ADMIN */}
            {user?.role === "ADMIN" && (
              <>
                <Sidebar.Item as={Link} to="/admin/dashboard/upload" icon={HiOutlineCloudUpload}>
                  Upload Book
                </Sidebar.Item>
                <Sidebar.Item as={Link} to="/admin/dashboard/manage" icon={HiInbox}>
                  Manage Books
                </Sidebar.Item>
                <Sidebar.Item as={Link} to="/admin/dashboard/manage-users" icon={HiUser}>
                  Users
                </Sidebar.Item>
              </>
            )}

            <Sidebar.Item as={Link} to="/admin/dashboard/favorite" icon={HiHeart}>
              Favorite
            </Sidebar.Item>
            <Sidebar.Item as={Link} to="/" icon={HiArrowSmLeft}>
              Back to Home
            </Sidebar.Item>
            <Sidebar.Item as={Link} to="/logout" icon={HiTable}>
              Log out
            </Sidebar.Item>
          </Sidebar.ItemGroup>

          {user?.role === "ADMIN" && (
          <Sidebar.ItemGroup>
            {/* Mấy cái link "#" thì vẫn giữ href, hoặc đổi thành button nếu có xử lý */}
            <Sidebar.Item href="https://https://book-management-backend-eghi.onrender.com/swagger-ui/index.html" target="_blank" icon={HiViewBoards}>
              Documentation
            </Sidebar.Item>
          </Sidebar.ItemGroup>)}
        </Sidebar.Items>
      </Sidebar>

      {/* Mobile Sidebar */}
      <div className='md:hidden'>
        <MobileDashboard />
      </div>
    </div>
  );
};

export default SideBar;
