import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { serviceTypeService } from '../services/serviceTypeService';
import { serviceCenterService } from '../services/serviceCenterService';
import { useAuth } from '../contexts/AuthContext';
import { BookingStatus } from '../types';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setVehicles(await vehicleService.getAll());
      setBookings(await bookingService.getAll());
      setServiceTypes(await serviceTypeService.getAll(true));
      setServiceCenters(await serviceCenterService.getAll());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      loadData();
    } catch (error) {
      alert('Error deleting vehicle');
    }
  };

  const handleSaveVehicle = async (data) => {
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, data);
      } else {
        await vehicleService.create(data);
      }
      setShowVehicleModal(false);
      loadData();
    } catch (error) {
      alert('Error saving vehicle');
    }
  };

  const handleCreateBooking = () => {
    setShowBookingModal(true);
  };

  const handleSaveBooking = async (data) => {
    try {
      
      const bookingData = {
        VehicleId: parseInt(data.vehicleId),
        ServiceTypeId: parseInt(data.serviceTypeId),
        ServiceCenterId: parseInt(data.serviceCenterId),
        BookingDate: data.bookingDate,

        BookingTime: data.bookingTime.length === 5 ? `${data.bookingTime}:00` : data.bookingTime,
        Status: 0, 
      };

      console.log("Duke dërguar këto të dhëna:", bookingData);

      await bookingService.create(bookingData);
      setShowBookingModal(false);
      loadData();
    } catch (error) {
      
      console.error('Detajet e gabimit 400:', error.response?.data);

      const errorMessage = error.response?.data?.message || 
                           (error.response?.data?.errors ? "Format i gabuar i të dhënave" : "Error creating booking");

      alert(errorMessage);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancel(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  const tabs = [
    { id: 'vehicles', label: 'My Vehicles' },
    { id: 'bookings', label: 'My Bookings' },
  ];

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Client Dashboard</h1>

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
          {activeTab === 'vehicles' && (
            <div className="mb-4">
              <button
                onClick={handleCreateVehicle}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Add Vehicle
              </button>
            </div>
          )}
          {activeTab === 'bookings' && (
            <div className="mb-4">
              <button
                onClick={handleCreateBooking}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                New Booking
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {activeTab === 'vehicles' && (
                <VehiclesList
                  vehicles={vehicles}
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteVehicle}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsList
                  bookings={bookings}
                  onCancel={handleCancelBooking}
                />
              )}
            </div>
          )}
        </div>

        {showVehicleModal && (
          <VehicleModal
            vehicle={editingVehicle}
            onClose={() => setShowVehicleModal(false)}
            onSave={handleSaveVehicle}
          />
        )}

        {showBookingModal && (
          <BookingModal
            vehicles={vehicles}
            serviceTypes={serviceTypes}
            serviceCenters={serviceCenters}
            onClose={() => setShowBookingModal(false)}
            onSave={handleSaveBooking}
          />
        )}
      </div>
    </Layout>
  );
};

const VehiclesList = ({ vehicles, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {vehicles.map((vehicle) => (
      <li key={vehicle.id} className="px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-900">
            {vehicle.make} {vehicle.model} ({vehicle.year || 'N/A'})
          </div>
          <div className="text-sm text-gray-500">License: {vehicle.licensePlate}</div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(vehicle)} className="text-primary-600 hover:text-primary-800">
            Edit
          </button>
          <button onClick={() => onDelete(vehicle.id)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </li>
    ))}
  </ul>
);

const BookingsList = ({ bookings, onCancel }) => (
  <ul className="divide-y divide-gray-200">
    {bookings.map((booking) => (
      <li key={booking.id} className="px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-gray-900">Booking #{booking.id}</div>
            <div className="text-sm text-gray-500">
              Date: {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
            </div>
            <div className="text-sm text-gray-500">Status: {BookingStatus[booking.status]}</div>
          </div>
          {booking.status !== BookingStatus.Cancelled && (
            <button
              onClick={() => onCancel(booking.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </li>
    ))}
  </ul>
);

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    vehicle || { make: '', model: '', licensePlate: '', year: '', color: '' }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">{vehicle ? 'Edit' : 'Add'} Vehicle</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Make"
              value={formData.make || ''}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Model"
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="License Plate"
              value={formData.licensePlate || ''}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Year"
              value={formData.year || ''}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Color"
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingModal = ({ vehicles, serviceTypes, serviceCenters, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    vehicleId: vehicles[0]?.id,
    serviceTypeId: serviceTypes[0]?.id,
    serviceCenterId: serviceCenters[0]?.id,
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: '09:00',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">New Booking</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              value={formData.vehicleId || ''}
              onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} - {v.licensePlate}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={formData.serviceTypeId || ''}
              onChange={(e) => setFormData({ ...formData, serviceTypeId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {serviceTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} - ${st.basePrice}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Center</label>
            <select
              value={formData.serviceCenterId || ''}
              onChange={(e) => setFormData({ ...formData, serviceCenterId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {serviceCenters.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.bookingDate || ''}
              onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={formData.bookingTime || ''}
              onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDashboard;