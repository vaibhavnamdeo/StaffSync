const User = require('../models/User');

// @desc    Get all employees / directory
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res) => {
  try {
    const { department, role, search } = req.query;
    let query = {};

    if (department) query.department = department;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin / Manager)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, position, designation, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = await User.create({
      name,
      email,
      password: password || 'TempPassword123!',
      role: role || 'employee',
      department: department || 'General',
      position: position || designation || 'Staff',
      phone: phone || ''
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      position: employee.position,
      phone: employee.phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, Manager, or Self)
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check authorization: Admin/Manager can update anyone, employee can only update self (limited fields)
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update other employees' });
    }

    const { name, department, position, designation, phone, avatar, isActive, role } = req.body;

    employee.name = name || employee.name;
    employee.department = department || employee.department;
    employee.position = position || designation || employee.position;
    employee.phone = phone !== undefined ? phone : employee.phone;
    employee.avatar = avatar !== undefined ? avatar : employee.avatar;

    // Only admin or manager can change role and active status
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      if (role) employee.role = role;
      if (isActive !== undefined) employee.isActive = isActive;
    }

    const updatedEmployee = await employee.save();
    const result = updatedEmployee.toObject();
    delete result.password;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete / Deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.isActive = false;
    await employee.save();

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
