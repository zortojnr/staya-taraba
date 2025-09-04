import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { protect, restrictTo, optionalAuth } from '../middleware/auth';

const router = Router();

// Get all locations
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { state, search, limit } = req.query;
    
    let query = supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (state) {
      query = query.ilike('state', `%${state}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,state.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const { data: locations, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve locations'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Locations retrieved successfully',
      data: { locations }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations'
    });
  }
});

// Get location by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location retrieved successfully',
      data: { location }
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve location'
    });
  }
});

// Get locations by state
router.get('/state/:state', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { state } = req.params;

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .ilike('state', `%${state}%`)
      .eq('is_active', true)
      .order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve locations'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Locations retrieved successfully',
      data: { locations }
    });
  } catch (error) {
    console.error('Get locations by state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations'
    });
  }
});

// Get nearby locations
router.get('/nearby/:lat/:lng', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 100 } = req.query; // radius in km

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseInt(radius as string);

    // Simple bounding box calculation (not perfect but good enough)
    const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lngDelta)
      .lte('longitude', longitude + lngDelta)
      .eq('is_active', true)
      .order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve nearby locations'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nearby locations retrieved successfully',
      data: { locations }
    });
  } catch (error) {
    console.error('Get nearby locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby locations'
    });
  }
});

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

// Create location
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      state,
      country = 'Nigeria',
      latitude,
      longitude,
      image_url,
      description
    } = req.body;

    if (!name || !state || !latitude || !longitude || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Name, state, coordinates, and image URL are required'
      });
    }

    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        name,
        state,
        country,
        latitude,
        longitude,
        image_url,
        description,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create location'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: { location }
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      success: false,
      message: 'Location creation failed'
    });
  }
});

// Update location
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: location, error } = await supabase
      .from('locations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update location'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: { location }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Location update failed'
    });
  }
});

// Delete location (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: location, error } = await supabase
      .from('locations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete location'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      message: 'Location deletion failed'
    });
  }
});

export default router;
