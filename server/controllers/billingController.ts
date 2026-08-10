import { Request, Response } from 'express';
import { getPlans, getBillingHistory, subscribeToPlan } from '../services/billingService.js';
import { IUser } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAvailablePlans = async (req: Request, res: Response) => {
  try {
    const plans = await getPlans();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching plans' });
  }
};

export const getUserBillingHistory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    const history = await getBillingHistory(user._id.toString());
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching billing history' });
  }
};

export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    const result = await subscribeToPlan(user._id.toString(), user.email, planId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Subscription failed' });
  }
};
