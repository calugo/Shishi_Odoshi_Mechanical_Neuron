try:
    from numba import jit
    import numpy as np
    import os, sys 


except ImportError as e:
    sys.stderr.write("Error loading module: %s\n"%str(e))
    sys.exit()


def Rcm(r1,r2,m1,m2):

    M=m1+m2+mb
    
    return ( m1*r1 + m2*r2)/M

def I(l,m1,m2,mb):
   
    I =l**2*( mb + 3*( m2 - m1)/12.0 )

    return I 

def F(thv,k):
    return np.array( [thv[1], k*np.sin(thv[0])] )

def boundary(l,thv,h):

    bc = np.zeros(2)

    y = -0.5*l*np.cos(thv[0])
    phio = -np.arccos(2*h/l) 

    #print(y,h,phio)

    if y < -h:
        #print(y,h,thv[0],phio,-0.5*l*np.cos(phio))
        bc[0]= phio
        bc[1]= 0.0
    else:
        bc = thv

    return bc

def boundary2(l,th,h,m2,m2o):
    bc = np.zeros(2)
    phio = -np.pi*0.5 # -np.arccos(2*h/l) 

    mrel=0.0    


    if th[0] < phio:
        bc[0]= phio
        bc[1]= 0.0
        mrel = 0.65*m2
        
        
    else:
        bc = th
        mrel = m2

    return bc, mrel

def m2t(phi, m1, m2, dt,h,l):
    mn = m2
    phio = -np.arccos(2*h/l) 
    
    if phi >= (phio-0.5):
        mn+=dt*0.0016
        if  mn>2.0*m1:
            mn = 1.5*m1
    
    return mn



def saveres(resarray,name):
    np.save(name+'.npy',resarray) 
    