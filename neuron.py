#!/usr/bin/env python3

from neuron_lib import *

def main(args):

    dt = 1e-4
    dtp = 1e-2

    l= 2.0; h= 0.5
    m1 = 0.01
    m2o = 0.005
    mb = 0.1
    g = 9.81
    
    r1 = np.array([l,0.0])
    r2 = np.array([l,0.0])

    phi =  -np.pi/2.0
    dphi = 0.00;
    #In = I(l,m1,m2o,mb)
    #Q = -(g/l)* 6 *( (m1-m2) / (mb+3*(m1-m2)) )
  
    t=0.0; tp = dtp;
    Tf = 150.5;
    N = int(Tf/dtp) 
    print(N)

    res = np.zeros((N,3));
    M2 = np.zeros((N,2));
    res[0,:] = [t,phi,dphi];
    M2[0,:] = [t,m2o];
    yn = np.array([phi,dphi])
    #print(res[0:3,:])
    n=1;
    m2 = m2o

    phio = np.arccos((2*h)/l)
    print(-phio,phi)

    while(t<Tf-dt):

        if (t>2.0):
            m2 = m2t(yn[0],m1,m2,dt,h,l)
        
        print(t,m2)

        Q = -(g/l)* 6 *( (m1-m2) / (mb+3*(m1-m2)) )


        K1 = F(yn ,Q)
        K2 = F(yn+dt*0.5*K1 ,Q)
        K3 = F(yn+dt*0.5*K2 ,Q)
        K4 = F(yn+dt*K3 ,Q)

        yn = yn + (dt/6.0)*(K1+2.0*K2+2.0*K3+K4)
        yn = boundary(l,yn,h)
        yn, m2 = boundary2(l,yn,h,m2,m2o)
        t+=dt

        if (t>tp):
            res[n,:]=[t,yn[0],yn[1]]
            M2[n,:]=[t,m2]
            tp+=dtp
            n+=1
        
    saveres(res,'rigid')
    saveres(M2,'mass')
    
if __name__ == "__main__":

    main(sys.argv[1:])