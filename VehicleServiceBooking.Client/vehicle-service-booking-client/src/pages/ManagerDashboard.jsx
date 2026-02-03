import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { serviceCenterService } from '../services/serviceCenterService';
import { serviceTypeService } from '../services/serviceTypeService';
import { mechanicService } from '../services/mechanicService';
import { partService } from '../services/partService';
import { scheduleService } from '../services/scheduleService';
import { bookingService } from '../services/bookingService';
import { workOrderService } from '../services/workOrderService';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('servicecenters');
  const [serviceCenters, setServiceCenters] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [parts, setParts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'servicecenters':
          setServiceCenters(await serviceCenterService.getAll());
          break;
        case 'servicetypes':
          setServiceTypes(await serviceTypeService.getAll());
          break;
        case 'mechanics':
          setMechanics(await mechanicService.getAll());
          break;
        case 'parts':
          setParts(await partService.getAll());
          break;
        case 'schedules':
          setSchedules(await scheduleService.getAll());
          break;
        case 'bookings':
          setBookings(await bookingService.getAll());
          break;
        case 'workorders':
          setWorkOrders(await workOrderService.getAll());
          break;
        case 'payments':
          setPayments(await paymentService.getAll());
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      switch (activeTab) {
        case 'servicecenters':
          await serviceCenterService.delete(id);
          break;
        case 'servicetypes':
          await serviceTypeService.delete(id);
          break;
        case 'mechanics':
          await mechanicService.delete(id);
          break;
        case 'parts':
          await partService.delete(id);
          break;
        case 'schedules':
          await scheduleService.delete(id);
          break;
        case 'workorders':
          await workOrderService.delete(id);
          break;
        case 'payments':
          await paymentService.delete(id);
          break;
      }
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    }
  };

  const handleSave = async (data) => {
    try {
      switch (activeTab) {
        case 'servicecenters':
          if (editingItem) {
            await serviceCenterService.update(editingItem.id, data);
          } else {
            await serviceCenterService.create(data);
          }
          break;
        case 'servicetypes':
          if (editingItem) {
            await serviceTypeService.update(editingItem.id, data);
          } else {
            await serviceTypeService.create(data);
          }
          break;
        case 'mechanics':
          if (editingItem) {
            await mechanicService.update(editingItem.id, data);
          } else {
            await mechanicService.create(data);
          }
          break;
        case 'parts':
          if (editingItem) {
            await partService.update(editingItem.id, data);
          } else {
            await partService.create(data);
          }
          break;
        case 'schedules':
          if (editingItem) {
            await scheduleService.update(editingItem.id, data);
          } else {
            await scheduleService.create(data);
          }
          break;
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving item');
    }
  };

  const handleRegisterMechanic = async (data) => {
    try {
      await authService.registerMechanic(data);
      setShowModal(false);
      loadData();
      alert('Mechanic registered successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error registering mechanic');
    }
  };

  const tabs = [
    { id: 'servicecenters', label: 'Service Centers' },
    { id: 'servicetypes', label: 'Service Types' },
    { id: 'mechanics', label: 'Mechanics' },
    { id: 'parts', label: 'Parts' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'workorders', label: 'Work Orders' },
    { id: 'payments', label: 'Payments' },
  ];

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manager Dashboard</h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab !== 'bookings' && activeTab !== 'workorders' && activeTab !== 'payments' && (
            <div className="mb-4">
              <button
                onClick={handleCreate}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Add New
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {activeTab === 'servicecenters' && (
                <ServiceCentersList
                  items={serviceCenters}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'servicetypes' && (
                <ServiceTypesList
                  items={serviceTypes}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'mechanics' && (
                <MechanicsList
                  items={mechanics}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'parts' && (
                <PartsList
                  items={parts}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'schedules' && (
                <SchedulesList
                  items={schedules}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'bookings' && <BookingsList items={bookings} />}
              {activeTab === 'workorders' && <WorkOrdersList items={workOrders} />}
              {activeTab === 'payments' && <PaymentsList items={payments} />}
            </div>
          )}
        </div>

        {showModal && (
          <Modal
            type={activeTab}
            item={editingItem}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
            onRegisterMechanic={activeTab === 'mechanics' ? handleRegisterMechanic : undefined}
          />
        )}
      </div>
    </Layout>
  );
};

// List Components
const ServiceCentersList = ({ items, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.address}, {item.city}</div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(item)} className="text-primary-600 hover:text-primary-800">Edit</button>
          <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </li>
    ))}
  </ul>
);

const ServiceTypesList = ({ items, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">${item.basePrice} - {item.estimatedDurationMinutes} min</div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(item)} className="text-primary-600 hover:text-primary-800">Edit</button>
          <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </li>
    ))}
  </ul>
);

const MechanicsList = ({ items, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-900">Mechanic #{item.id}</div>
          <div className="text-sm text-gray-500">{item.specialization}</div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(item)} className="text-primary-600 hover:text-primary-800">Edit</button>
          <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </li>
    ))}
  </ul>
);

const PartsList = ({ items, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">${item.unitPrice} - Stock: {item.stockQuantity}</div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(item)} className="text-primary-600 hover:text-primary-800">Edit</button>
          <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </li>
    ))}
  </ul>
);

const SchedulesList = ({ items, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-900">Mechanic #{item.mechanicId}</div>
          <div className="text-sm text-gray-500">Day: {item.dayOfWeek}, {item.startTime} - {item.endTime}</div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(item)} className="text-primary-600 hover:text-primary-800">Edit</button>
          <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </li>
    ))}
  </ul>
);

const BookingsList = ({ items }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4">
        <div className="font-medium text-gray-900">Booking #{item.id}</div>
        <div className="text-sm text-gray-500">Date: {new Date(item.bookingDate).toLocaleDateString()}, Status: {item.status}</div>
      </li>
    ))}
  </ul>
);

const WorkOrdersList = ({ items }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4">
        <div className="font-medium text-gray-900">Work Order #{item.id}</div>
        <div className="text-sm text-gray-500">Status: {item.status}, Total: ${item.totalCost || 0}</div>
      </li>
    ))}
  </ul>
);

const PaymentsList = ({ items }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item) => (
      <li key={item.id} className="px-6 py-4">
        <div className="font-medium text-gray-900">Payment #{item.id}</div>
        <div className="text-sm text-gray-500">Amount: ${item.amount}, Status: {item.status}</div>
      </li>
    ))}
  </ul>
);

// Modal Component
const Modal = ({ type, item, onClose, onSave, onRegisterMechanic }) => {
  const [formData, setFormData] = useState(item || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'mechanics' && !item && onRegisterMechanic) {
      onRegisterMechanic(formData);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">{item ? 'Edit' : 'Create'} {type}</h3>
        <form onSubmit={handleSubmit}>
          {/* Form fields based on type */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerDashboard;

