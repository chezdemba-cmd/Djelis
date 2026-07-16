import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class RevenueShareService {
  constructor(private prisma: PrismaService) {}

  async calculatePeriodSplit(startDateStr: string, endDateStr: string) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // 1. Get successful payments in this period
    const payments = await this.prisma.payment.findMany({
      where: {
        status: "SUCCESSFUL",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Sum total revenue in XOF (convert EUR to XOF: 1 EUR = 656 XOF)
    let totalRevenueXof = 0;
    for (const payment of payments) {
      const amt = Number(payment.amount);
      if (payment.currency.toUpperCase() === "EUR") {
        totalRevenueXof += amt * 656;
      } else {
        totalRevenueXof += amt;
      }
    }

    // 2. Get watch history entries within this period
    const watchHistories = await this.prisma.watchHistory.findMany({
      where: {
        lastWatchedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        content: {
          include: {
            creator: {
              include: {
                partner: {
                  include: {
                    contracts: {
                      where: {
                        status: "ACTIVE",
                        startDate: { lte: endDate },
                        endDate: { gte: startDate },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Sum watch time per partner and total watch time
    let totalWatchTimeSec = 0;
    const partnerWatchTimeSec: Record<
      string,
      { seconds: number; partnerName: string; contractPercentage: number }
    > = {};

    for (const history of watchHistories) {
      const progress = history.progressSeconds;
      totalWatchTimeSec += progress;

      const partner = history.content?.creator?.partner;
      if (partner) {
        const contract = partner.contracts[0]; // Active contract
        const percentage = contract
          ? Number(contract.revenueSharePercentage)
          : 0;

        if (!partnerWatchTimeSec[partner.id]) {
          partnerWatchTimeSec[partner.id] = {
            seconds: 0,
            partnerName: partner.companyName,
            contractPercentage: percentage,
          };
        }
        partnerWatchTimeSec[partner.id].seconds += progress;
      }
    }

    // 3. Compute earnings per partner
    const partnerEarnings = [];
    for (const [partnerId, data] of Object.entries(partnerWatchTimeSec)) {
      const shareFraction =
        totalWatchTimeSec > 0 ? data.seconds / totalWatchTimeSec : 0;
      const grossShareXof = totalRevenueXof * shareFraction;
      const netPayoutXof = grossShareXof * (data.contractPercentage / 100);

      partnerEarnings.push({
        partner_id: partnerId,
        company_name: data.partnerName,
        watch_time_seconds: data.seconds,
        watch_time_percentage: Number((shareFraction * 100).toFixed(2)),
        gross_share_xof: Number(grossShareXof.toFixed(2)),
        contract_percentage: data.contractPercentage,
        net_payout_xof: Number(netPayoutXof.toFixed(2)),
      });
    }

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      total_revenue_xof: Number(totalRevenueXof.toFixed(2)),
      total_watch_time_seconds: totalWatchTimeSec,
      payouts: partnerEarnings,
    };
  }
}
