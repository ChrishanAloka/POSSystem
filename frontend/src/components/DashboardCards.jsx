import { Link } from 'react-router-dom';

function DashboardCards() {
  const cards = [
    {
      title: 'User Details',
      description: 'Manage and view user information',
      to: '/users',
      icon: '👥',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Employee Registration',
      description: 'Access the employee registration form',
      to: '/register-employee',
      icon: '💼',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Employee Management',
      description: 'View and edit employee information',
      to: '/employees',
      icon: '👤',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Attendance Mark',
      description: 'Mark employee attendance',
      to: '/attendance/mark',
      icon: '⏰',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Attendance Table',
      description: 'View and manage attendance records',
      to: '/attendance/records',
      icon: '📊',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Salary Management',
      description: 'Manage employee salaries and overtime',
      to: '/salary',
      icon: '💰',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Summary Reports',
      description: 'Generate all reports in one place',
      to: '/reports',
      icon: '📝',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Quotation',
      description: 'Create and manage quotations',
      to: '/quotation',
      icon: '📋',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Quotation List',
      description: 'View all quotations',
      to: '/quotations',
      icon: '📃',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Invoice List',
      description: 'View and manage invoices',
      to: '/invoices',
      icon: '💵',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Add Supplier',
      description: 'Add a new supplier',
      to: '/suppliers/add',
      icon: '➕🏭',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Supplier Management',
      description: 'Manage supplier details',
      to: '/suppliers',
      icon: '🏭',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Product Management',
      description: 'Manage product inventory',
      to: '/products',
      icon: '📦',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Add Expense',
      description: 'Add new expenses',
      to: '/expenses/add',
      icon: '💸',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Expense Management',
      description: 'View and manage expenses',
      to: '/expenses',
      icon: '📑',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
    {
      title: 'Invoice & Quotation Summary',
      description: 'View combined quotation and invoice details',
      to: '/summary',
      icon: '📈',
      color: 'bg-white-100 border-black-500 text-black-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Link
          key={index}
          to={card.to}
          className={`block p-6 border-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 ${card.color} text-center`}
        >
          <div className="text-4xl mb-4">{card.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
          <p className="text-gray-600">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default DashboardCards;