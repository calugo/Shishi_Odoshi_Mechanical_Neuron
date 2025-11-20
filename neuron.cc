#define _USE_MATH_DEFINES
#include<iostream>
#include<cmath>
using namespace std;

double t = 0.0; 
double dt = 1e-4;
double dtp = 1e-2;
double arr[2];

double dphi ( double Y );
double ddphi( double X,  double k );
void rk( double x, double y , double gn , double *arr );
void boundaryA(double x, double y, double l, double h, double *arr);
double m2t(double x, double m2, double dt, double m1, double h,double l );
double boundaryB(double x,double y, double l,double h,double m2, double *arr );
///
double boundaryB(double x, double y,  double l,double h,double m2, double *arr ){

    double pn = - M_PI_2 - acos(2*h/l);
    double mrel = 0.0;
    double xn,yn;
    if(x<pn){
        xn = pn;
        yn = 0.0;
        mrel = 0.65*m2;
    }
    else{
        xn = x;
        yn = y;
        mrel = m2;
    }

    arr[0] = xn; arr[1] = yn;

    return mrel;
}
///
double m2t(double x, double m2, double dt, double m1, double h,double l ){

    double mn;
    mn=m2;
    double phib = -acos((2*h)/l);
    if(x>= (phib-0.5) ){
        mn+=dt*0.0016;
        if (mn>2.0*m1){mn=1.5*m1;}
    }

    return mn;

}
////
void boundaryA(double x, double y, double l,double h, double *arr){

    double yn = -0.5*l*cos(x);
    double phin = -acos(2*h/l);

    //cout<<yn<<"\n";
    if (yn<(-h)){
        x = phin;
        y=  0.0;
    }

    arr[0]=x;
    arr[1]=y;

}
////
double dphi(double Y){
    return Y;
}
////
double ddphi(double X, double k){
    return k*sin(X);
}
////
void rk(double x, double y, double gn, double *arr){


    double K1[2]; double K2[2]; double K3[2]; double K4[2];
    double DT = (dt/6.0);

    K1[0] = dphi(y);
    K1[1] = ddphi(x,gn);

    K2[0] = dphi(y+dt*0.5*K1[0]);
    K2[1] = ddphi(x+dt*0.5*K1[1],gn);

    K3[0] = dphi(y+dt*0.5*K2[0]);
    K3[1] = ddphi(x+dt*0.5*K2[1],gn);

    K4[0] = dphi(y+dt*K3[0]);
    K4[1] = ddphi(x+dt*K3[1],gn);

    x += DT*( K1[0] + 2.0*K2[0] + 2.0*K3[0] + K4[0] );
    y += DT*( K1[1] + 2.0*K2[1] + 2.0*K3[1] + K4[1] );

    arr[0] = x; 
    arr[1] = y;
}
////
int main(int argc, char** argv){

    double l = 2.0;
    double h = 0.5;
    double m1 = 0.01;
    double m2o = 0.005;
    double mb = 0.1;
    double g = 9.81;
    double Qn, m2;
    double phi,phio;
    double dtphi;
    double ddtphi;

    double Tf = 100.0;
    double tp = dtp;
    
    int N = int(Tf/dtp);
   
    phio =  - M_PI_2;//math.pi/2.0;  //acos( (2*h)/l );
    phi = phio;
    dtphi = 0.0;
    m2 = m2o;

    //cout<<N<<" "<<phio<<"\n";

    while(t< (Tf-dt) ){
        
        
        if (t>2.0){
            m2 = m2t(phi, m2, dt, m1, h, l );
        }
    
        Qn = -(g/l)*6*( (m1-m2) / ( mb + 3*(m1-m2) ) );

        rk(phi,dtphi,Qn,arr);
        phi=arr[0];dtphi=arr[1];
        boundaryA(phi,dtphi,l,h,arr);
        phi=arr[0];dtphi = arr[1];
        m2 = boundaryB(phi,dtphi,l,h,m2,arr);
        phi=arr[0];dtphi = arr[1];
        
        t+=dt;

        if (t>tp){
            cout<<t<<","<<phi<<","<<dtphi<<","<<m2<<"," << Qn<<"\n";
            //cout<<m2<<"\n";
            tp+=dtp;
        }
    }

}
